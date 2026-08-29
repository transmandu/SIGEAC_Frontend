"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    useGetAllUnitConversions,
    useMutateUnitConversionRow,
    type UnitConversionRow,
} from "@/hooks/mantenimiento/almacen/articulos/useArticleUnitConversions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ConversionDirection } from "@/types/supervisor";
import { AlertTriangle, Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

const TYPE_LABEL: Record<UnitConversionRow["convertible_type"], string> = {
    general_article: "Artículo general",
    consumable: "Consumible",
};

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
        if (candidate > 0 && Math.abs(inverted - candidate) < 1e-6) return candidate;
    }

    return inverted;
}

/**
 * Todas las conversiones registradas y a qué artículo pertenecen.
 *
 * Existe para poder auditarlas: una equivalencia invertida no falla, produce
 * un número plausible en la unidad equivocada, así que hace falta verlas
 * juntas para detectar la que está mal.
 */
export function ConversionsRegistryPanel() {
    const { selectedCompany } = useCompanyStore();
    const { data: rows, isLoading, isError } = useGetAllUnitConversions(selectedCompany?.slug);
    const { updateConversion, deleteConversion } = useMutateUnitConversionRow(
        selectedCompany?.slug,
    );

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | UnitConversionRow["convertible_type"]>("all");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [editDirection, setEditDirection] = useState<ConversionDirection>("base_per_unit");
    const [pendingDelete, setPendingDelete] = useState<UnitConversionRow | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return (rows ?? []).filter((row) => {
            if (typeFilter !== "all" && row.convertible_type !== typeFilter) return false;
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

    // Se abre en la dirección con que se capturó: quien declaró "1 UNIDAD = 36
    // YARDAS" no reconoce su conversión si el formulario le muestra 0.0277…
    const startEdit = (row: UnitConversionRow) => {
        const inverse =
            row.captured_direction === "units_per_base" ||
            (!row.captured_direction && row.base_per_unit < 1);

        setEditingId(row.id);
        setEditDirection(inverse ? "units_per_base" : "base_per_unit");
        setEditValue(
            String(inverse ? readableInverse(row.base_per_unit) : row.base_per_unit),
        );
    };

    const commitEdit = (row: UnitConversionRow) => {
        const value = Number(editValue);
        if (!Number.isFinite(value) || value <= 0) return;

        updateConversion.mutate(
            { row, direction: editDirection, value },
            { onSuccess: () => setEditingId(null) },
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando conversiones...
            </div>
        );
    }

    if (isError) {
        return (
            <p className="py-16 text-center text-sm text-muted-foreground">
                No se pudieron cargar las conversiones.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    placeholder="Buscar por artículo, unidad o equivalencia..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="sm:max-w-xs"
                />
                <Select
                    value={typeFilter}
                    onValueChange={(next) => setTypeFilter(next as typeof typeFilter)}
                >
                    <SelectTrigger className="sm:w-[190px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los artículos</SelectItem>
                        <SelectItem value="general_article">Artículos generales</SelectItem>
                        <SelectItem value="consumable">Consumibles</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground sm:ml-auto">
                    {filtered.length} de {rows?.length ?? 0}
                </span>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Artículo</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Unidad base</TableHead>
                            <TableHead>Equivalencia</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-28 text-center text-sm text-muted-foreground"
                                >
                                    {rows?.length
                                        ? "Ninguna conversión coincide con la búsqueda."
                                        : "Aún no hay conversiones registradas. Se crean desde cada artículo."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((row) => {
                                const isEditing = editingId === row.id;

                                return (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {row.orphaned && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                El artículo dueño de esta conversión ya
                                                                no existe. Puede eliminarla sin riesgo.
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                <span>
                                                    {row.article?.name ?? "—"}
                                                    {row.article?.detail && (
                                                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                                            ({row.article.detail})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {TYPE_LABEL[row.convertible_type]}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {row.base_unit?.label ?? "—"}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <Select
                                                        value={editDirection}
                                                        onValueChange={(next) =>
                                                            setEditDirection(next as ConversionDirection)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[210px] text-xs">
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
                                                        className="h-8 w-40"
                                                        value={editValue}
                                                        onChange={(event) => setEditValue(event.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                // Se muestra la lectura legible y el factor
                                                // canónico queda en el tooltip: es el que usa
                                                // el cálculo y quien audita necesita verlo.
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-sm tabular-nums">
                                                                {row.lectura_legible ??
                                                                    row.lectura ??
                                                                    `1 ${row.unit?.label ?? "?"} = ${row.base_per_unit}`}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            Factor guardado: 1{" "}
                                                            {row.unit?.label ?? "?"} ={" "}
                                                            {row.base_per_unit}{" "}
                                                            {row.base_unit?.label ?? "?"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-0.5">
                                                {isEditing ? (
                                                    <>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-8"
                                                                        onClick={() => commitEdit(row)}
                                                                    >
                                                                        <Check className="size-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Guardar</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-8"
                                                                        onClick={() => setEditingId(null)}
                                                                    >
                                                                        <X className="size-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Cancelar</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </>
                                                ) : (
                                                    <>
                                                        {!row.orphaned && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-8"
                                                                            onClick={() => startEdit(row)}
                                                                        >
                                                                            <Pencil className="size-3.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        Editar equivalencia
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-8"
                                                                        onClick={() => setPendingDelete(row)}
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Eliminar</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={!!pendingDelete}
                onOpenChange={(next) => !next && setPendingDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta conversión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingDelete?.lectura_legible ??
                                pendingDelete?.lectura ??
                                "La equivalencia se eliminará."}
                            {" "}Los movimientos ya registrados conservan el factor con que se
                            calcularon, pero el artículo dejará de poder despacharse en{" "}
                            {pendingDelete?.unit?.label ?? "esa unidad"}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingDelete) deleteConversion.mutate(pendingDelete);
                                setPendingDelete(null);
                            }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
