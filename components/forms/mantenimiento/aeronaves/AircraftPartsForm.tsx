"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, Folder, FolderOpen, Layers, Layers2, MinusCircle, PlusCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

// 1. Esquema actualizado con removed_date
const PartSchema: any = z.object({
    id: z.any().optional(),
    serial: z.string().optional(),
    manufacturer_id: z.string().optional(),
    part_name: z.string().min(1, "Nombre obligatorio").max(50),
    part_number: z.string().min(1, "Número obligatorio").regex(/^[A-Za-z0-9\-]+$/),
    ata_chapter: z.string().optional(),
    position: z.string().optional(),
    time_since_new: z.number().nullable().optional(),
    time_since_overhaul: z.number().nullable().optional(),
    cycles_since_new: z.number().nullable().optional(),
    cycles_since_overhaul: z.number().nullable().optional(),
    condition_type: z.enum(["NEW", "OVERHAULED"]),
    is_father: z.boolean().default(false),
    assigned_date: z.string().nullable().optional(),
    removed_date: z.string().nullable().optional(),
    sub_parts: z.array(z.lazy(() => PartSchema)).optional()
});

const PartsFormSchema = z.object({
    parts: z.array(PartSchema).min(1)
});

type PartsFormType = z.infer<typeof PartsFormSchema>;

type RawPart = {
    id?: number | string;
    serial?: string;
    manufacturer_id?: string;
    part_name?: string;
    part_number?: string;
    ata_chapter?: string;
    position?: string;
    time_since_new?: number | string | null;
    time_since_overhaul?: number | string | null;
    cycles_since_new?: number | string | null;
    cycles_since_overhaul?: number | string | null;
    csn_na?: boolean;
    cso_na?: boolean;
    condition_type?: "NEW" | "OVERHAULED" | string | null;
    is_father?: boolean;
    assigned_date?: string | null;
    parent_part_id?: number | string | null;
    sub_parts?: RawPart[];
};

type AircraftAssignmentLike = {
    removed_date?: string | null;
    aircraft_part?: RawPart | null;
};

type InitialPartsLike = PartsFormType & {
    aircraft_parts?: RawPart[];
    aircraft_assignments?: AircraftAssignmentLike[];
};

const toNullableRoundedNumber = (value: number | string | null | undefined, decimals = 0) => {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return null;

    const factor = 10 ** decimals;
    return Math.round(parsed * factor) / factor;
};

const normalizePart = (part: any): z.infer<typeof PartSchema> => {
    const normalizedSubParts = (part.sub_parts || []).map(normalizePart);

    return {
        id: part.id,
        serial: part.serial || "",
        manufacturer_id: part.manufacturer_id || "",
        part_name: part.part_name || "",
        part_number: part.part_number || "",
        ata_chapter: part.ata_chapter || "",
        position: part.position || "",
        time_since_new: toNullableRoundedNumber(part.time_since_new, 2),
        time_since_overhaul: toNullableRoundedNumber(part.time_since_overhaul, 2),
        cycles_since_new: toNullableRoundedNumber(part.cycles_since_new),
        cycles_since_overhaul: toNullableRoundedNumber(part.cycles_since_overhaul),
        condition_type: part.condition_type === "OVERHAULED" ? "OVERHAULED" : "NEW",
        is_father: typeof part.is_father === "boolean" ? part.is_father : normalizedSubParts.length > 0,
        assigned_date: part.assigned_date || null,
        removed_date: part.removed_date || null,
        sub_parts: normalizedSubParts
    };
};

const buildPartsFromAssignments = (assignments: AircraftAssignmentLike[] = []): z.infer<typeof PartSchema>[] => {
    const activeParts = assignments
        .filter((assignment) => assignment.removed_date === null || assignment.removed_date === undefined)
        .map((assignment) => assignment.aircraft_part)
        .filter((part): part is RawPart => Boolean(part));

    const partsById = new Map<string, RawPart>();

    const collectPartTree = (part: RawPart) => {
        const key = String(part.id ?? `${part.parent_part_id ?? "root"}-${part.part_number ?? part.part_name ?? Math.random()}`);
        const existing = partsById.get(key);

        partsById.set(key, {
            ...part,
            sub_parts: part.sub_parts || existing?.sub_parts || []
        });
        (part.sub_parts || []).forEach(collectPartTree);
    };

    activeParts.forEach(collectPartTree);

    const parts = Array.from(partsById.values());
    const childrenByParent = new Map<string, RawPart[]>();
    parts.forEach((part) => {
        if (part.parent_part_id === null || part.parent_part_id === undefined) return;

        const parentKey = String(part.parent_part_id);
        const siblings = childrenByParent.get(parentKey) || [];

        if (!siblings.some((sibling) => String(sibling.id) === String(part.id))) {
            siblings.push(part);
            childrenByParent.set(parentKey, siblings);
        }
    });

    const composeTree = (part: RawPart): RawPart => {
        const nestedChildren = (part.sub_parts || []).map(composeTree);
        const relatedChildren = childrenByParent.get(String(part.id ?? "")) || [];
        const mergedChildren = [...nestedChildren];
        relatedChildren.forEach((child) => {
            if (!mergedChildren.some((existing) => String(existing.id) === String(child.id))) {
                mergedChildren.push(composeTree(child));
            }
        });
        return {
            ...part,
            sub_parts: mergedChildren
        };
    };

    return parts
        .filter((part) => part.parent_part_id === null || part.parent_part_id === undefined)
        .map(composeTree)
        .map(normalizePart);
};

const usePartValue = <T,>(control: Control<PartsFormType>, path: string, defaultValue?: T): T => {
    return useWatch({
        control,
        name: path as any,
        defaultValue
    });
};

export function AircraftPartsInfoForm({ onNext, onBack, initialData }: {
    onNext: (data: PartsFormType) => void,
    onBack: (data: PartsFormType) => void,
    initialData?: any
}) {
    const { toast } = useToast();
    const [removingPath, setRemovingPath] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const normalizedInitialData = useMemo(() => {
        if (initialData?.parts) return { parts: initialData.parts.map(normalizePart) };
        return { parts: [{ condition_type: "NEW", removed_date: null }] };
    }, [initialData]);

    const form = useForm<PartsFormType>({
        resolver: zodResolver(PartsFormSchema),
        defaultValues: normalizedInitialData
    });

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "parts"
    });

    const reactivatePartTree = (path: string) => {
        form.setValue(`${path}.removed_date` as any, null);
        const currentSubparts = form.getValues(`${path}.sub_parts` as any) || [];
        currentSubparts.forEach((_: any, index: number) => {
            reactivatePartTree(`${path}.sub_parts.${index}`);
        });
    };

    const applyRemoval = () => {
        if (!removingPath) return;
        const applyDateRecursively = (path: string, date: string) => {
            form.setValue(`${path}.removed_date` as any, date);
            const currentSubparts = form.getValues(`${path}.sub_parts` as any) || [];
            currentSubparts.forEach((_: any, index: number) => {
                applyDateRecursively(`${path}.sub_parts.${index}`, date);
            });
        };

        applyDateRecursively(removingPath, tempDate);
        setRemovingPath(null);
        toast({ title: "Pieza marcada como removida" });
    };

    const removeItem = (fullPath: string) => {
        setRemovingPath(fullPath);
    };

    const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});

    const toggleExpand = (path: string) => {
        setExpandedParts(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const addSubpart = (partPath: string) => {
        const currentSubparts = form.getValues(`${partPath}.sub_parts` as any) || [];
        form.setValue(`${partPath}.sub_parts` as any, [
            ...currentSubparts,
            { condition_type: "NEW" }
        ]);
        if (!expandedParts[partPath]) {
            toggleExpand(partPath);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} className="space-y-6 mt-4">
                {/* MODAL DE CONFIRMACIÓN DE REMOCIÓN */}
                {removingPath && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-destructive">
                                <AlertTriangle size={24} />
                                <h3 className="text-lg font-bold">Confirmar Remoción</h3>
                            </div>
                            <div className="bg-destructive/10 p-3 rounded-md mb-4 border border-destructive/20">
                                <p className="text-[12px] text-destructive-foreground font-medium">
                                    Al remover esta pieza, todas sus sub-partes instaladas
                                    quedarán inactivas automáticamente.
                                </p>
                            </div>
                            <FormLabel>Fecha de remoción</FormLabel>
                            <Input
                                type="date"
                                value={tempDate}
                                onChange={(e) => setTempDate(e.target.value)}
                                className="mb-6 mt-2"
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" type="button" onClick={() => setRemovingPath(null)}>Cancelar</Button>
                                <Button variant="destructive" type="button" onClick={applyRemoval}>Confirmar Remoción</Button>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Partes de Aeronave</h2>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-auto">
                            <div className="p-4 space-y-4">
                                {fields.map((field, index) => (
                                    <PartSection
                                        key={field.id}
                                        form={form}
                                        index={index}
                                        path={`parts.${index}`}
                                        level={0}
                                        onRemove={removeItem}
                                        onReactivate={reactivatePartTree}
                                        onToggleExpand={toggleExpand}
                                        isExpanded={expandedParts[`parts.${index}`] || false}
                                        onAddSubpart={addSubpart}
                                        expandedParts={expandedParts}
                                    />
                                ))}

                                {/* BOTÓN DE AGREGAR PARTE PRINCIPAL */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ condition_type: "NEW" })}
                                    className="w-full border-dashed py-8"
                                >
                                    <PlusCircle className="size-4 mr-2" />
                                    Agregar Parte Principal
                                </Button>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => onBack(form.getValues())}>Anterior</Button>
                    <Button type="submit">Siguiente</Button>
                </div>
            </form>
        </Form>
    );
}

function PartSection({
    form,
    index,
    path,
    level,
    onRemove,
    onReactivate,
    onToggleExpand,
    isExpanded,
    onAddSubpart,
    expandedParts
}: {
    form: any;
    index: number;
    path: string;
    level: number;
    onRemove: (fullPath: string) => void;
    onReactivate: (path: string) => void;
    onToggleExpand: (path: string) => void;
    isExpanded: boolean;
    onAddSubpart: (path: string) => void;
    expandedParts: Record<string, boolean>;
}) {
    const isRemoved = usePartValue<string | null>(form.control, `${path}.removed_date`, null);
    const hassub_parts = usePartValue<boolean>(form.control, `${path}.is_father`, false);
    const sub_parts = usePartValue<any[]>(form.control, `${path}.sub_parts`, []);
    const partName = usePartValue<string>(form.control, `${path}.part_name`, "");
    const partNumber = usePartValue<string>(form.control, `${path}.part_number`, "");
    const [timeNa, setTimeNa] = useState(false)
    const [cycleNa, setCycleNa] = useState(false)

    return (
        <Card className={`overflow-hidden ${level > 0 ? 'ml-6' : ''} ${isRemoved ? 'opacity-60 bg-muted/50' : ''}`}>
            <Collapsible open={isExpanded && !isRemoved} onOpenChange={() => !isRemoved && onToggleExpand(path)}>
                <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild disabled={!!isRemoved}>
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isExpanded && !isRemoved ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>

                        <div className="flex items-center gap-2">
                            {hassub_parts ? (
                                isExpanded && !isRemoved ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-500" />
                            ) : (
                                <div className="h-4 w-4 rounded-full bg-primary/20"></div>
                            )}

                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${isRemoved ? 'line-through text-muted-foreground' : ''}`}>
                                    {partName || `Parte ${index + 1}`}
                                    {partNumber && <Badge variant="outline" className="ml-2">{partNumber}</Badge>}
                                </span>
                                {isRemoved ? (
                                    <span className="text-[10px] text-destructive font-bold uppercase tracking-wider mt-0.5">
                                        Removida el: {isRemoved}
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {level === 0 ? 'Parte principal' : `Subparte ${index + 1}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isRemoved ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onReactivate(path)}
                                className="h-8 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                                <RefreshCw size={14} className="mr-1" />
                                Reactivar {level === 0 && "Sistema"}
                            </Button>
                        ) : (
                            <>
                                {hassub_parts && sub_parts.length > 0 && (
                                    <Badge variant="secondary" className="mr-2">
                                        {sub_parts.length} subparte{sub_parts.length !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(path)}
                                    className="h-8 w-8 text-destructive"
                                >
                                    <MinusCircle size={16} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <CollapsibleContent>
                    <div className="p-4 space-y-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`${path}.part_name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la parte</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Motor, Ala, Tren de aterrizaje" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`${path}.part_number`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Parte</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: ENG-001, WNG-202" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name={`${path}.ata_chapter`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ATA Chapter</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: 32, 71, 72" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`${path}.position`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Posición</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: LH, RH, CTR" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`${path}.assigned_date`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Asignación</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Interruptor General - Tiempo */}
                        <div className="flex items-center space-x-2 mb-4 bg-muted/50 p-2 rounded-md w-fit">
                            <Checkbox
                                id={`toggleTime-${path}`}
                                checked={timeNa}
                                onCheckedChange={(checked) => {
                                    const isChecked = !!checked;
                                    setTimeNa(isChecked);
                                    if (isChecked) {
                                        form.setValue(`${path}.time_since_new`, null);
                                        form.setValue(`${path}.time_since_overhaul`, null);
                                    }
                                }}
                            />
                            <Label htmlFor={`toggleTime-${path}`} className="text-sm font-medium cursor-pointer">
                                (TSN/TSO) no aplica para este componente
                            </Label>
                        </div>

                        {!timeNa && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                <FormField
                                    control={form.control}
                                    name={`${path}.time_since_new`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TSN</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Ej: 1500"
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`${path}.time_since_overhaul`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TSO</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Ej: 1500"
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* 1. Interruptor General */}
                        <div className="flex items-center space-x-2 mb-4 bg-muted/50 p-2 rounded-md w-fit">
                            <Checkbox
                                id="toggleCycles"
                                checked={cycleNa}
                                onCheckedChange={(checked) => {
                                    const isChecked = !!checked;
                                    setCycleNa(isChecked);
                                    // Si no aplican, reseteamos ambos valores en el formulario
                                    if (isChecked) {
                                        form.setValue(`${path}.cycles_since_new`, null);
                                        form.setValue(`${path}.cycles_since_overhaul`, null);
                                    }
                                }}
                            />
                            <Label htmlFor="toggleCycles" className="text-sm font-medium cursor-pointer">
                                (CSN/CSO) no aplican para este componente
                            </Label>
                        </div>

                        {/* 2. Renderizado Condicional */}
                        {!cycleNa && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                {/* Campo CSN */}
                                <FormField
                                    control={form.control}
                                    name={`${path}.cycles_since_new`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CSN</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Ej: 1500"
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Campo CSO */}
                                <FormField
                                    control={form.control}
                                    name={`${path}.cycles_since_overhaul`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CSO</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Ej: 300"
                                                    value={field.value ?? ""}
                                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name={`${path}.condition_type`}
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Condición</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="NEW" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Nueva</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="OVERHAULED" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Reacondicionada</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`${path}.is_father`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Esta parte contiene subpartes</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                Marque si necesita agregar componentes dentro de esta parte
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {hassub_parts && (
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">Subpartes</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onAddSubpart(path)}
                                    >
                                        <PlusCircle className="size-3.5 mr-2" /> Agregar Subparte
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {sub_parts.map((_: any, subIndex: number) => {
                                        const subPartPath = `${path}.sub_parts.${subIndex}`;
                                        return (
                                            <PartSection
                                                key={subIndex}
                                                form={form}
                                                index={subIndex}
                                                path={subPartPath}
                                                level={level + 1}
                                                onRemove={onRemove}
                                                onReactivate={onReactivate}
                                                onToggleExpand={onToggleExpand}
                                                isExpanded={expandedParts[subPartPath] || false}
                                                onAddSubpart={onAddSubpart}
                                                expandedParts={expandedParts}
                                            />
                                        );
                                    })}

                                    {sub_parts.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            <p>No hay subpartes agregadas</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onAddSubpart(path)}
                                                className="mt-2"
                                            >
                                                <PlusCircle className="size-3.5 mr-2" /> Agregar la primera subparte
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
