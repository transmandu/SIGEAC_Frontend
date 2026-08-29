"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits";
import {
    useGetUnitConversionPresets,
    useMutateUnitConversionPreset,
    type UnitConversionPreset,
} from "@/hooks/mantenimiento/almacen/articulos/useUnitConversionCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Unit } from "@/types";
import type { ConversionDirection } from "@/types/supervisor";
import { Loader2, Plus, Ruler, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

function sanitizeDecimal(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
}

/**
 * Catálogo de equivalencias reutilizables.
 *
 * Son plantillas, no conversiones: no pertenecen a ningún artículo y no afectan
 * a ningún stock. Un artículo las COPIA al darse de alta su conversión, y a
 * partir de ahí la fila es suya; editar aquí no reescribe lo ya copiado.
 */
export function ConversionCatalogPanel() {
    const { selectedCompany } = useCompanyStore();
    const { data: presets, isLoading } = useGetUnitConversionPresets(
        selectedCompany?.slug,
    );
    const { deletePreset } = useMutateUnitConversionPreset(selectedCompany?.slug);

    const [creating, setCreating] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<UnitConversionPreset | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando catálogo...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                    {presets?.length ?? 0}{" "}
                    {presets?.length === 1 ? "equivalencia" : "equivalencias"}
                </span>

                {!creating && (
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => setCreating(true)}>
                        <Plus className="size-3.5" />
                        Nueva equivalencia
                    </Button>
                )}
            </div>

            {creating && <NewPresetForm onDone={() => setCreating(false)} />}

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Equivalencia</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Unidad base</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!presets?.length ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-28 text-center text-sm text-muted-foreground"
                                >
                                    El catálogo está vacío. Agregue las equivalencias
                                    estándar que se repiten entre artículos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            presets.map((preset) => (
                                <TableRow key={preset.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium tabular-nums">
                                                {preset.lectura}
                                            </span>
                                            {preset.is_physical && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge
                                                                variant="secondary"
                                                                className="gap-1 px-1.5 text-[10px]"
                                                            >
                                                                <Ruler className="size-3" />
                                                                Física
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            Equivalencia física verificable:
                                                            vale igual para cualquier artículo.
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {preset.name ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {preset.base_unit?.label ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        onClick={() => setPendingDelete(preset)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Quitar del catálogo
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))
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
                        <AlertDialogTitle>
                            ¿Quitar esta equivalencia del catálogo?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingDelete?.lectura} dejará de ofrecerse al crear
                            conversiones. Los artículos que ya la copiaron conservan la
                            suya: no se ve afectado ningún stock.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingDelete) deletePreset.mutate(pendingDelete.id);
                                setPendingDelete(null);
                            }}
                        >
                            Quitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
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
    const [direction, setDirection] = useState<ConversionDirection>("base_per_unit");
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
        !!baseUnitId && !!unitId && Number.isFinite(numericValue) && numericValue > 0;

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
        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nueva equivalencia</span>
                <Button variant="ghost" size="icon" className="size-7" onClick={onDone}>
                    <X className="size-3.5" />
                </Button>
            </div>

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
                                <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
                                    {unit.label} ({unit.value})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Unidad a convertir</label>
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
                                <SelectItem key={unit.id} value={String(unit.id)} className="text-xs">
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
                        <SelectTrigger className="h-9 text-xs sm:w-[260px]">
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
                            onChange={(event) => setValue(sanitizeDecimal(event.target.value))}
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

            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={submit}
                    disabled={!isValid || createPreset.isPending}
                >
                    {createPreset.isPending && (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    )}
                    Agregar al catálogo
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onDone}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
