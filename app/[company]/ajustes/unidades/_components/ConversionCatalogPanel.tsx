"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Ruler, Trash2 } from "lucide-react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  SettingsRowActions,
  type RowAction,
} from "@/components/dropdowns/SettingsRowActions";
import { SettingsDataTable } from "@/components/tables/SettingsDataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import {
  useGetUnitConversionPresets,
  useMutateUnitConversionPreset,
  type UnitConversionPreset,
} from "@/hooks/mantenimiento/almacen/articulos/useUnitConversionCatalog";
import { type AppColumnDef } from "@/lib/table";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Unit } from "@/types";
import type { ConversionDirection } from "@/types/supervisor";

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function PresetRowActions({ preset }: { preset: UnitConversionPreset }) {
  const { selectedCompany } = useCompanyStore();
  const { deletePreset } = useMutateUnitConversionPreset(selectedCompany?.slug);
  const [openDelete, setOpenDelete] = useState(false);

  const actions: RowAction[] = [
    {
      key: "delete",
      label: "Quitar del catálogo",
      icon: Trash2,
      tone: "red",
      onSelect: () => setOpenDelete(true),
    },
  ];

  return (
    <>
      <SettingsRowActions actions={actions} />

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Quitar equivalencia"
        entityName={preset.lectura}
        warning={
          <>
            Dejará de ofrecerse al crear conversiones. Los artículos que ya la
            copiaron conservan la suya: no se ve afectado ningún stock.
          </>
        }
        isPending={deletePreset.isPending}
        onConfirm={() => deletePreset.mutateAsync(preset.id)}
      />
    </>
  );
}

const columns: AppColumnDef<UnitConversionPreset>[] = [
  {
    id: "lectura",
    size: 300,
    accessorFn: (preset) => preset.lectura ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Equivalencia" />
      </div>
    ),
    meta: { title: "Equivalencia" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2 w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
          {row.original.lectura}
        </span>
        {row.original.is_physical && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TagBadge tone="blue" icon={Ruler}>
                  Física
                </TagBadge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Equivalencia física verificable: vale igual para cualquier
                artículo.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    ),
  },
  {
    id: "name",
    size: 260,
    accessorFn: (preset) => preset.name ?? "",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground text-center">
          {row.original.name || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "base_unit",
    size: 200,
    accessorFn: (preset) => preset.base_unit?.label ?? "",
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
        <PresetRowActions preset={row.original} />
      </div>
    ),
  },
];

/**
 * Catálogo de equivalencias reutilizables.
 *
 * Son plantillas, no conversiones: no pertenecen a ningún artículo y no afectan
 * a ningún stock. Un artículo las COPIA al darse de alta su conversión, y a
 * partir de ahí la fila es suya; editar aquí no reescribe lo ya copiado.
 */
export function ConversionCatalogPanel() {
  const { selectedCompany } = useCompanyStore();
  const {
    data: presets,
    isPending,
    isError,
    refetch,
  } = useGetUnitConversionPresets(selectedCompany?.slug);

  return (
    <SettingsDataTable
      columns={columns}
      data={presets ?? []}
      loading={isPending}
      error={isError}
      errorMessage="No se pudo cargar el catálogo"
      onRetry={() => refetch()}
      emptyMessage="El catálogo está vacío. Agregue las equivalencias estándar que se repiten entre artículos."
      actions={<NewPresetDialog />}
    />
  );
}

function NewPresetDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear equivalencia
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creación de Equivalencia</DialogTitle>
          <DialogDescription>
            Plantilla reutilizable: el artículo copia el número y la conversión
            resultante es suya.
          </DialogDescription>
        </DialogHeader>
        <NewPresetForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Alta de una equivalencia del catálogo.
 *
 * Pide las dos unidades porque un preset no tiene artículo: la equivalencia sólo
 * podrá copiarse a artículos cuya unidad base sea la que se elija aquí.
 */
function NewPresetForm({ onDone }: { onDone: () => void }) {
  const { selectedCompany } = useCompanyStore();
  const { data: units, isLoading } = useGetUnits(selectedCompany?.slug);
  const { createPreset } = useMutateUnitConversionPreset(selectedCompany?.slug);

  const [baseUnitId, setBaseUnitId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");
  const [direction, setDirection] =
    useState<ConversionDirection>("base_per_unit");
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [isPhysical, setIsPhysical] = useState(false);

  const labelOf = (id: number | "") =>
    units?.find((unit: Unit) => unit.id === id)?.label ?? "";

  const baseLabel = labelOf(baseUnitId) || "unidad base";
  const unitLabel = labelOf(unitId) || "unidad";

  // Una unidad no se convierte a sí misma.
  const alternateUnits = useMemo(
    () => (units ?? []).filter((unit: Unit) => unit.id !== baseUnitId),
    [units, baseUnitId],
  );

  const numericValue = Number(value);
  const isValid =
    !!baseUnitId &&
    !!unitId &&
    Number.isFinite(numericValue) &&
    numericValue > 0;

  const submit = () => {
    if (!isValid) return;

    createPreset.mutate(
      {
        unit_id: Number(unitId),
        base_unit_id: Number(baseUnitId),
        direction,
        value: numericValue,
        name: name.trim() || null,
        is_physical: isPhysical,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Unidad base del artículo
          </label>
          <Select
            value={baseUnitId === "" ? "" : String(baseUnitId)}
            onValueChange={(next) => {
              setBaseUnitId(Number(next));
              if (Number(next) === unitId) setUnitId("");
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent>
              {(units ?? []).map((unit: Unit) => (
                <SelectItem
                  key={unit.id}
                  value={String(unit.id)}
                  className="text-xs"
                >
                  {unit.label} ({unit.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Unidad a convertir
          </label>
          <Select
            value={unitId === "" ? "" : String(unitId)}
            onValueChange={(next) => setUnitId(Number(next))}
            disabled={isLoading || !baseUnitId}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue
                placeholder={
                  baseUnitId ? "Seleccione..." : "Elija primero la base"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {alternateUnits.map((unit: Unit) => (
                <SelectItem
                  key={unit.id}
                  value={String(unit.id)}
                  className="text-xs"
                >
                  {unit.label} ({unit.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!!unitId && (
        <>
          <Select
            value={direction}
            onValueChange={(next) => setDirection(next as ConversionDirection)}
          >
            <SelectTrigger className="h-9 text-xs sm:w-65">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base_per_unit" className="text-xs">
                1 {unitLabel} = ? {baseLabel}
              </SelectItem>
              <SelectItem value="units_per_base" className="text-xs">
                1 {baseLabel} = ? {unitLabel}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              1 {direction === "base_per_unit" ? unitLabel : baseLabel} =
            </span>
            <Input
              autoFocus
              type="text"
              inputMode="decimal"
              placeholder="Ej: 3.78541"
              value={value}
              onChange={(event) =>
                setValue(sanitizeDecimal(event.target.value))
              }
              className="h-9 w-32"
            />
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {direction === "base_per_unit" ? baseLabel : unitLabel}
            </span>
          </div>
        </>
      )}

      <Input
        placeholder="Nombre (opcional). Ej: Galón a litros"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="h-9 text-xs"
      />

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={isPhysical}
          onCheckedChange={(next) => setIsPhysical(next === true)}
          className="mt-0.5"
        />
        <span>
          Es una equivalencia física verificable (galón a litro, libra a kilo).
          Las de empaque —caja, rollo, set— dependen de cada artículo y se
          marcan como tales para que nadie las copie a ciegas.
        </span>
      </label>

      <Button
        className="w-full bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
        onClick={submit}
        disabled={!isValid || createPreset.isPending}
      >
        {createPreset.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Agregar al catálogo"
        )}
      </Button>
    </div>
  );
}
