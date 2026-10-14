"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetAllUnitConversions,
  useMutateUnitConversionRow,
  type UnitConversionRow,
} from "@/hooks/mantenimiento/almacen/articulos/useArticleUnitConversions";
import { type AppColumnDef } from "@/lib/table";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ConversionDirection } from "@/types/supervisor";

const TYPE_LABEL: Record<UnitConversionRow["convertible_type"], string> = {
  general_article: "Artículo general",
  consumable: "Consumible",
};

type TypeFilter = "all" | UnitConversionRow["convertible_type"];

/**
 * El valor que el usuario escribió en la lectura inversa, recuperado del factor.
 *
 * Invertir no lo devuelve tal cual: el factor se guardó redondeado a 12
 * decimales, así que 1/0.027777777778 da 35.999999999712 en vez de 36. Se
 * redondea a los decimales mínimos que reproduzcan el valor para no mostrar esa
 * basura en el formulario de edición.
 */
function readableInverse(factor: number): number {
  const inverted = 1 / factor;

  for (let decimals = 0; decimals <= 8; decimals++) {
    const candidate = Number(inverted.toFixed(decimals));
    if (candidate > 0 && Math.abs(inverted - candidate) < 1e-6)
      return candidate;
  }

  return inverted;
}

/**
 * Se abre en la dirección con que se capturó: quien declaró "1 UNIDAD = 36
 * YARDAS" no reconoce su conversión si el formulario le muestra 0.0277…
 */
function initialEdit(row: UnitConversionRow) {
  const inverse =
    row.captured_direction === "units_per_base" ||
    (!row.captured_direction && row.base_per_unit < 1);

  return {
    direction: (inverse
      ? "units_per_base"
      : "base_per_unit") as ConversionDirection,
    value: String(
      inverse ? readableInverse(row.base_per_unit) : row.base_per_unit,
    ),
  };
}

function EditConversionForm({
  row,
  onDone,
}: {
  row: UnitConversionRow;
  onDone: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const { updateConversion } = useMutateUnitConversionRow(
    selectedCompany?.slug,
  );
  const initial = useMemo(() => initialEdit(row), [row]);
  const [direction, setDirection] = useState<ConversionDirection>(
    initial.direction,
  );
  const [value, setValue] = useState(initial.value);

  const numeric = Number(value);
  const isValid = Number.isFinite(numeric) && numeric > 0;

  const submit = () => {
    if (!isValid) return;

    updateConversion.mutate(
      { row, direction, value: numeric },
      { onSuccess: onDone },
    );
  };

  return (
    <div className="space-y-3">
      <Select
        value={direction}
        onValueChange={(next) => setDirection(next as ConversionDirection)}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="base_per_unit" className="text-xs">
            1 {row.unit?.label} = ? {row.base_unit?.label}
          </SelectItem>
          <SelectItem value="units_per_base" className="text-xs">
            1 {row.base_unit?.label} = ? {row.unit?.label}
          </SelectItem>
        </SelectContent>
      </Select>

      <Input
        autoFocus
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        className="h-9"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <Button
        className="w-full bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
        onClick={submit}
        disabled={!isValid || updateConversion.isPending}
      >
        {updateConversion.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Actualizar"
        )}
      </Button>
    </div>
  );
}

function ConversionRowActions({ row }: { row: UnitConversionRow }) {
  const { selectedCompany } = useCompanyStore();
  const { deleteConversion } = useMutateUnitConversionRow(
    selectedCompany?.slug,
  );
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const actions: RowAction[] = [
    // Una fila huérfana ya no tiene artículo activo: solo queda eliminarla.
    ...(row.orphaned
      ? []
      : [
          {
            key: "edit",
            label: "Editar equivalencia",
            icon: Pencil,
            tone: "blue" as const,
            onSelect: () => setOpenEdit(true),
          },
        ]),
    {
      key: "delete",
      label: "Eliminar conversión",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>Editar equivalencia</DialogTitle>
            <DialogDescription>
              Modifique la conversión de{" "}
              <span className="font-medium text-foreground">
                {row.article?.name ?? "este artículo"}
              </span>
            </DialogDescription>
          </DialogHeader>
          <EditConversionForm row={row} onDone={() => setOpenEdit(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar conversión"
        entityName={row.lectura_legible ?? row.lectura ?? undefined}
        warning={
          <>
            Los movimientos ya registrados conservan el factor con que se
            calcularon, pero el artículo dejará de poder despacharse en{" "}
            {row.unit?.label ?? "esa unidad"}.
          </>
        }
        isPending={deleteConversion.isPending}
        onConfirm={() => deleteConversion.mutateAsync(row)}
      />
    </>
  );
}

const columns: AppColumnDef<UnitConversionRow>[] = [
  {
    id: "article",
    size: 300,
    accessorFn: (row) =>
      `${row.article?.name ?? ""} ${row.article?.detail ?? ""}`.trim(),
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Artículo" />
      </div>
    ),
    meta: { title: "Artículo" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2 w-full">
        {row.original.orphaned && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                El artículo dueño de esta conversión ya no está activo, así que
                la equivalencia no se puede editar. Solo queda eliminarla.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.article?.name ?? "—"}
          {row.original.article?.detail && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({row.original.article.detail})
            </span>
          )}
        </span>
      </div>
    ),
  },
  {
    id: "type",
    size: 180,
    accessorFn: (row) => TYPE_LABEL[row.convertible_type],
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground">
          {TYPE_LABEL[row.original.convertible_type]}
        </span>
      </div>
    ),
  },
  {
    id: "base_unit",
    size: 180,
    accessorFn: (row) => row.base_unit?.label ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Unidad base" />
      </div>
    ),
    meta: { title: "Unidad base" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.base_unit?.label ?? "—"}
        </span>
      </div>
    ),
  },
  {
    id: "equivalence",
    size: 260,
    accessorFn: (row) => row.lectura_legible ?? row.lectura ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Equivalencia" />
      </div>
    ),
    meta: { title: "Equivalencia" },
    // Se muestra la lectura legible y el factor canónico queda en el tooltip:
    // es el que usa el cálculo y quien audita necesita verlo.
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm tabular-nums text-slate-700 dark:text-slate-200">
                {row.original.lectura_legible ??
                  row.original.lectura ??
                  `1 ${row.original.unit?.label ?? "?"} = ${row.original.base_per_unit}`}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Factor guardado: 1 {row.original.unit?.label ?? "?"} ={" "}
              {row.original.base_per_unit}{" "}
              {row.original.base_unit?.label ?? "?"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <ConversionRowActions row={row.original} />
      </div>
    ),
  },
];

/**
 * Todas las conversiones registradas y a qué artículo pertenecen.
 *
 * Existe para poder auditarlas: una equivalencia invertida no falla, produce
 * un número plausible en la unidad equivocada, así que hace falta verlas
 * juntas para detectar la que está mal.
 */
export function ConversionsRegistryPanel() {
  const { selectedCompany } = useCompanyStore();
  const {
    data: rows,
    isPending,
    isError,
    refetch,
  } = useGetAllUnitConversions(selectedCompany?.slug);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (rows ?? []).filter((row) => {
      if (typeFilter !== "all" && row.convertible_type !== typeFilter)
        return false;
      if (!term) return true;

      return [
        row.article?.name,
        row.article?.detail,
        row.unit?.label,
        row.base_unit?.label,
        row.lectura,
        row.lectura_legible,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [rows, search, typeFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <div className="relative w-64 sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por artículo, unidad o equivalencia..."
            className="pl-8 h-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground" />
          <Select
            value={typeFilter}
            onValueChange={(next) => setTypeFilter(next as TypeFilter)}
          >
            <SelectTrigger className="h-8 w-50 pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="all">Todos los artículos</SelectItem>
              <SelectItem value="general_article">
                Artículos generales
              </SelectItem>
              <SelectItem value="consumable">Consumibles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SettingsDataTable
        columns={columns}
        data={filtered}
        loading={isPending}
        error={isError}
        errorMessage="No se pudieron cargar las conversiones"
        onRetry={() => refetch()}
        filtered={!!search.trim() || typeFilter !== "all"}
        emptyMessage="Aún no hay conversiones registradas. Se crean desde cada artículo."
      />
    </div>
  );
}
