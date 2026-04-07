import { useCallback, useEffect, useState } from "react";



import {
    Calculator,
    Loader2,
    Plus,
    X,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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


import { Convertion } from "@/types";
interface UnitSelection {
    conversion_id: number;
}


export function UnitsModal({
    open,
    onOpenChange,
    secondaryUnits,
    selectedUnits,
    onSelectedUnitsChange,
    primaryUnit,
    allUnits,
    availableConversionUnits,
    availableConversion,
    onConversionResult,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    secondaryUnits: Convertion[];
    selectedUnits: UnitSelection[];
    onSelectedUnitsChange: (units: UnitSelection[]) => void;
    primaryUnit?: any;
    allUnits?: any[];
    availableConversionUnits?: {
        id: number;
        value: string;
        label: string;
        registered_by: string;
        updated_by: string | null;
    }[];
    availableConversion?: any[];
    onConversionResult?: (result: string) => void;
}) {
    const [currentUnitId, setCurrentUnitId] = useState<number | "">("");
    const [showConversionForm, setShowConversionForm] = useState(false);
    const [conversionFromUnit, setConversionFromUnit] = useState<string>("");
    const [conversionToUnit, setConversionToUnit] = useState<string>("");
    const [conversionQuantity, setConversionQuantity] = useState<string>("");
    const [conversionResult, setConversionResult] = useState<string>("");
    const [isCalculating, setIsCalculating] = useState(false);

    const availableUnits = availableConversion?.filter(
        (unit) =>
            !selectedUnits.some((selected) => selected.conversion_id === unit.id),
    );

    const calculateConversionLocally = useCallback(() => {
        if (!conversionFromUnit || !conversionToUnit || !conversionQuantity) {
            setConversionResult("");
            onConversionResult?.("");
            return;
        }

        const quantity = parseFloat(conversionQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            setConversionResult("");
            onConversionResult?.("");
            return;
        }

        setIsCalculating(true);

        const conversion = availableConversion?.find(
            (conv: any) =>
                conv.primary_unit.id.toString() === conversionFromUnit &&
                conv.secondary_unit.id.toString() === conversionToUnit,
        );

        if (conversion && conversion.equivalence) {
            const result = quantity / conversion.equivalence;
            const resultValue = result.toFixed(6).replace(/\.?0+$/, "");

            setConversionResult(resultValue);
            onConversionResult?.(resultValue);
        } else {
            setConversionResult("No se encontró conversión");
            onConversionResult?.("No se encontró conversión");
        }

        setIsCalculating(false);
    }, [
        conversionFromUnit,
        conversionToUnit,
        conversionQuantity,
        availableConversion,
        onConversionResult,
    ]);

    useEffect(() => {
        calculateConversionLocally();
    }, [calculateConversionLocally]);

    useEffect(() => {
        if (primaryUnit?.id) {
            setConversionToUnit(primaryUnit.id.toString());
        }
    }, [primaryUnit]);

    const addUnit = () => {
        if (!currentUnitId) return;

        const newUnit: UnitSelection = {
            conversion_id: currentUnitId as number,
        };

        const updatedUnits = [...selectedUnits, newUnit];
        onSelectedUnitsChange(updatedUnits);
        setCurrentUnitId("");
    };

    const removeUnit = (unitId: number) => {
        const updatedUnits = selectedUnits.filter(
            (unit) => unit.conversion_id !== unitId,
        );
        onSelectedUnitsChange(updatedUnits);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Configurar Conversiones de Unidades</DialogTitle>
                    <DialogDescription>
                        Seleccione las conversiones de unidades adicionales para este
                        artículo o cree nuevas conversiones.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Conversiones Existentes</h3>
                        <Button
                            onClick={() => setShowConversionForm(!showConversionForm)}
                            variant="outline"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            {showConversionForm ? "Cancelar" : "Conversión"}
                        </Button>
                    </div>

                    {showConversionForm && (
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Desde Unidad</label>
                                    <Select
                                        value={conversionFromUnit}
                                        onValueChange={setConversionFromUnit}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione unidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableConversionUnits?.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    {unit.label} ({unit.value})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-center">
                                    <span className="text-lg font-semibold">→</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hacia Unidad</label>
                                    <Select
                                        value={conversionToUnit}
                                        onValueChange={setConversionToUnit}
                                        disabled={true}
                                    >
                                        <SelectTrigger>
                                            <SelectValue>
                                                {primaryUnit
                                                    ? `${primaryUnit.label} (${primaryUnit.value})`
                                                    : "Seleccione unidad primaria"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {primaryUnit && (
                                                <SelectItem value={primaryUnit.id.toString()}>
                                                    {primaryUnit.label} ({primaryUnit.value})
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cantidad</label>
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        placeholder="Ej: 100"
                                        value={conversionQuantity}
                                        onChange={(e) => setConversionQuantity(e.target.value)}
                                        min="0"
                                        step="0.001"
                                    />
                                </div>

                                <div className="flex items-end">
                                    {isCalculating && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Calculando...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {conversionFromUnit &&
                                conversionToUnit &&
                                availableConversion && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            Conversión: {conversionQuantity || "0"}{" "}
                                            {
                                                availableConversionUnits?.find(
                                                    (u) => u.id.toString() === conversionFromUnit,
                                                )?.label
                                            }{" "}
                                            → {conversionResult} {primaryUnit?.label}
                                            {availableConversion.find(
                                                (conv: any) =>
                                                    conv.primary_unit.id.toString() ===
                                                    conversionFromUnit &&
                                                    conv.secondary_unit.id.toString() ===
                                                    conversionToUnit,
                                            )?.equivalence && (
                                                    <span className="block text-xs mt-1">
                                                        Equivalencia: 1{" "}
                                                        {
                                                            availableConversionUnits?.find(
                                                                (u) => u.id.toString() === conversionFromUnit,
                                                            )?.label
                                                        }{" "}
                                                        ={" "}
                                                        {1 /
                                                            availableConversion.find(
                                                                (conv: any) =>
                                                                    conv.primary_unit.id.toString() ===
                                                                    conversionFromUnit &&
                                                                    conv.secondary_unit.id.toString() ===
                                                                    conversionToUnit,
                                                            )!.equivalence}{" "}
                                                        {primaryUnit?.label}
                                                    </span>
                                                )}
                                        </p>
                                    </div>
                                )}

                            {conversionResult &&
                                !isCalculating &&
                                conversionResult !== "No se encontró conversión" && (
                                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Resultado de la Conversión
                                            </label>
                                            <Input
                                                type="text"
                                                value={conversionResult}
                                                readOnly
                                                className="bg-white font-semibold"
                                                placeholder="El resultado aparecerá aquí..."
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                {conversionQuantity}{" "}
                                                {availableConversionUnits?.find(
                                                    (u) => u.id.toString() === conversionFromUnit,
                                                )?.label || conversionFromUnit}{" "}
                                                = {conversionResult}{" "}
                                                {primaryUnit?.label || "unidad primaria"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {conversionResult === "No se encontró conversión" && (
                                <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                                    <p className="text-sm text-destructive">
                                        No se encontró una conversión definida para estas unidades.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Elegir Conversiones Para Despacho
                            </label>
                            <Select
                                value={currentUnitId.toString()}
                                onValueChange={(value) =>
                                    setCurrentUnitId(value ? parseInt(value) : "")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una conversión" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUnits?.map((conversion) => (
                                        <SelectItem
                                            key={conversion.id}
                                            value={conversion.id.toString()}
                                        >
                                            {conversion.primary_unit?.label}
                                            <span className="text-light ml-1">
                                                ({conversion.primary_unit?.value})
                                            </span>
                                            {conversion.secondary_unit?.label &&
                                                ` - ${conversion.secondary_unit.label} (${conversion.secondary_unit.value})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <Button onClick={addUnit} disabled={!currentUnitId}>
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Conversiones seleccionadas:</h4>
                        {selectedUnits.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                                No hay conversiones seleccionadas
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selectedUnits.map((unit) => {
                                    const conversionInfo = secondaryUnits.find(
                                        (u) => u.id === unit.conversion_id,
                                    );
                                    return (
                                        <div
                                            key={unit.conversion_id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="font-medium">
                                                    {conversionInfo?.primary_unit.label}
                                                    {conversionInfo?.secondary_unit?.label &&
                                                        ` (${conversionInfo.secondary_unit.label})`}
                                                </span>
                                                {conversionInfo?.equivalence && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Equivalencia: {conversionInfo.equivalence}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeUnit(unit.conversion_id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

