"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle } from "lucide-react"
import PartsList from "./parts-form/PartsList"
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"



// 1. Esquema actualizado con removed_date
const PartSchema: any = z.object({
    id: z.any().optional(),
    serial: z.string().optional(),
    manufacturer_id: z.string().optional(),

    type: z.string().min(1, "Tipo obligatorio").max(50),
    position: z.enum(["LH", "RH"]).optional(),
    part_order: z.number().nullable().optional(),

    part_number: z.string().min(1, "Número obligatorio"),
    ata_chapter: z.string().optional(),

    time_since_new: z.number().nullable().optional(),
    time_since_overhaul: z.number().nullable().optional(),
    cycles_since_new: z.number().nullable().optional(),
    cycles_since_overhaul: z.number().nullable().optional(),

    condition_type: z.enum(["NEW", "OVERHAULED"]),
    is_father: z.boolean().default(false),
    removed_date: z.string().nullable().optional(),

    sub_parts: z.array(z.lazy(() => PartSchema)).optional()
})

const PartsFormSchema = z.object({
    parts: z.array(PartSchema)
})

export const PART_CATEGORIES: Record<string, string> = {
    ENGINE: "Planta de Poder",
    APU: "APU",
    PROPELLER: "Hélice",
};

type PartsFormType = z.infer<typeof PartsFormSchema>

type RawPart = {
    id?: number | string;
    serial?: string;
    manufacturer_id?: string;
    type?: string;
    part_number?: string;
    ata_chapter?: string | null;
    position?: string | null;
    part_order?: number | null;
    time_since_new?: number | string | null;
    time_since_overhaul?: number | string | null;
    cycles_since_new?: number | string | null;
    cycles_since_overhaul?: number | string | null;
    condition_type?: "NEW" | "OVERHAULED" | string | null;
    is_father?: boolean;
    parent_part_id?: number | string | null;
    sub_parts?: RawPart[];
};

type AircraftAssignmentLike = {
    removed_date?: string | null;
    aircraft_part?: RawPart | null;
    position?: string | null;
    part_order?: number | null;
    ata_chapter?: string | null;
};

type InitialPartsLike = PartsFormType & {
    aircraft_parts?: RawPart[];
    aircraft_assignments?: AircraftAssignmentLike[];
};

const toNumber = (value: number | string | null | undefined) => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const nullableNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const normalizePartType = (type?: string | null) => {
    if (!type) return "";
    return String(type).trim().toUpperCase();
};

const normalizePart = (part: any): z.infer<typeof PartSchema> => {
    const normalizedSubParts = (part.sub_parts || []).map(normalizePart);
    return {
        id: part.id,
        serial: part.serial || "",
        manufacturer_id: part.manufacturer_id || "",
        type: normalizePartType(part.type),
        part_number: part.part_number || "",
        ata_chapter: part.ata_chapter || part.ata_number || part.ata || "",
        position: part.position || undefined,
        part_order: part.part_order ?? null,
        time_since_new: nullableNumber(part.time_since_new),
        time_since_overhaul: nullableNumber(part.time_since_overhaul),
        cycles_since_new: nullableNumber(part.cycles_since_new),
        cycles_since_overhaul: nullableNumber(part.cycles_since_overhaul),
        condition_type: part.condition_type === "OVERHAULED" ? "OVERHAULED" : "NEW",
        is_father: typeof part.is_father === "boolean" ? part.is_father : normalizedSubParts.length > 0,
        removed_date: part.removed_date || null,
        sub_parts: normalizedSubParts
    };
};

const buildPartsFromAssignments = (assignments: AircraftAssignmentLike[] = []): z.infer<typeof PartSchema>[] => {
    const entries = assignments.filter(a => a.removed_date === null || a.removed_date === undefined);

    const activeEntries: RawPart[] = entries.map((assignment) => {
        const src = (assignment.aircraft_part as any) ?? (assignment as any);
        const assignmentData = assignment as any;
        const position = assignmentData.position ?? src.position ?? null;
        const part_order = assignmentData.part_order ?? src.part_order ?? null;
        const ata_chapter = assignmentData.ata_chapter ?? src.ata_chapter ?? assignmentData.ata_number ?? src.ata_number ?? src.ata ?? null;
        const time_since_new = assignmentData.time_since_new ?? src.time_since_new ?? null;
        const time_since_overhaul = assignmentData.time_since_overhaul ?? src.time_since_overhaul ?? null;
        const cycles_since_new = assignmentData.cycles_since_new ?? src.cycles_since_new ?? null;
        const cycles_since_overhaul = assignmentData.cycles_since_overhaul ?? src.cycles_since_overhaul ?? null;
        const condition_type = assignmentData.condition_type ?? src.condition_type ?? "NEW";
        const type = assignmentData.type ?? src.type ?? "";
        const serial = assignmentData.serial ?? src.serial ?? "";
        const manufacturer_id = assignmentData.manufacturer_id ?? src.manufacturer_id ?? "";

        return {
            ...(src ?? {}),
            type,
            serial,
            manufacturer_id,
            time_since_new,
            time_since_overhaul,
            cycles_since_new,
            cycles_since_overhaul,
            condition_type,
            position,
            part_order,
            ata_chapter,
        } as RawPart;
    }).filter(Boolean);

    const partsById = new Map<string, RawPart>();

    const collectPartTree = (part: RawPart) => {
        const key = String(part.id ?? `${part.parent_part_id ?? "root"}-${part.part_number ?? part.type ?? Math.random()}`);
        const existing = partsById.get(key);

        partsById.set(key, {
            ...part,
            sub_parts: part.sub_parts || existing?.sub_parts || []
        });
        (part.sub_parts || []).forEach(collectPartTree);
    };

    activeEntries.forEach(collectPartTree);

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

// helpers moved to parts-form/constants.ts

export function AircraftPartsInfoForm({ onNext, onBack, initialData }: {
    onNext: (data: PartsFormType) => void,
    onBack: (data: PartsFormType) => void,
    initialData?: any
}) {
    const { toast } = useToast();
    const [removingPath, setRemovingPath] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const normalizedInitialData = useMemo(() => {
        if (initialData?.parts) {
            const parts = (initialData.parts || []).map((p: any) => normalizePart(p));
            return { parts: parts.length ? parts : [{ condition_type: "NEW", removed_date: null }] };
        }

        if (initialData?.aircraft_parts) {
            const parts = (initialData.aircraft_parts || []).map((p: any) => normalizePart(p));
            return { parts: parts.length ? parts : [{ condition_type: "NEW", removed_date: null }] };
        }

        if (initialData?.aircraft_assignments) {
            const parts = buildPartsFromAssignments(initialData.aircraft_assignments || []);
            return { parts: parts.length ? parts : [{ condition_type: "NEW", removed_date: null }] };
        }

        return { parts: [{ condition_type: "NEW", removed_date: null }] }
    }, [initialData])

    const form = useForm<PartsFormType>({
        resolver: zodResolver(PartsFormSchema),
        defaultValues: normalizedInitialData
    })

    useEffect(() => {
        form.reset(normalizedInitialData);
    }, [form, normalizedInitialData]);

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "parts"
    })

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

    const handleNext = (data: PartsFormType) => {
        console.log("Validated data:", data);
        onNext(data);
    }

    const handleError = (errors: any) => {
        console.log("Form submit errors:", errors);
        toast({ title: "Errores en el formulario", description: "Revisa los campos marcados en rojo." });
    }

    const submitFiltered = () => {
        const values = form.getValues();
        const parts = values.parts || [];

        // Keep mapping of original indexes for error mapping
        const origIndices: number[] = [];
        const activeParts = parts.reduce((acc: any[], p: any, i: number) => {
            if (!p || p.removed_date) return acc;
            origIndices.push(i);
            acc.push(p);
            return acc;
        }, [] as any[]);

        // Validate only active parts using zod
        const parsed = PartsFormSchema.safeParse({ parts: activeParts });
        form.clearErrors();
        if (!parsed.success) {
            parsed.error.errors.forEach(err => {
                const [idx, field] = err.path as any[];
                const orig = origIndices[idx];
                if (orig !== undefined && field) {
                    form.setError(`parts.${orig}.${String(field)}` as any, { type: 'manual', message: err.message });
                }
            });
            toast({ title: 'Errores en el formulario', description: 'Corrige los campos marcados.' });
            return;
        }

        // If valid, send all parts (registered and removals) to the next step
        onNext({ parts });
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mt-4">
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

                <PartsList
                    fields={fields}
                    form={form}
                    append={append}
                    onRemove={removeItem}
                    onReactivate={reactivatePartTree}
                    onToggleExpand={toggleExpand}
                    expandedParts={expandedParts}
                    onAddSubpart={addSubpart}
                />

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => onBack(form.getValues())}>Anterior</Button>
                    <Button type="button" onClick={submitFiltered}>Siguiente</Button>
                </div>
            </form>
        </Form>
    );
}

