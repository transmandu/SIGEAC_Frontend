"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";

import {
    useCreateMitigationAnalysis,
    useCreateMitigationPlan,
    useUpdateMitigationAnalysis,
    useUpdateMitigationPlan,
} from "@/actions/mantenimiento/sms/evaluacion_mitigacion/actions";
import RiskMatrix from "@/components/misc/RiskMatrix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getResult } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
    Analysis,
    HazardNotification,
    MitigationPlan,
} from "@/types/sms/mantenimiento";

const FORM_SCHEMA = z.object({
    area_responsible: z.string().min(1, "Seleccione el área responsable"),
    description: z
        .string()
        .min(5, "La descripción debe tener al menos 5 caracteres")
        .max(1000, "La descripción no puede exceder los 1000 caracteres"),
    possible_consequences: z
        .string()
        .min(1, "Debe ingresar al menos una consecuencia"),
    consequence_to_evaluate: z
        .string()
        .min(1, "Seleccione la consecuencia a evaluar"),
    probability: z.string().min(1, "Seleccione la probabilidad"),
    severity: z.string().min(1, "Seleccione la severidad"),
});

const ANALYSIS_ONLY_SCHEMA = z.object({
    area_responsible: z.string().optional(),
    description: z.string().optional(),
    possible_consequences: z.string().optional(),
    consequence_to_evaluate: z.string().optional(),
    probability: z.string().min(1, "Seleccione la probabilidad"),
    severity: z.string().min(1, "Seleccione la severidad"),
});

type FormValues = {
    area_responsible: string;
    description: string;
    possible_consequences: string;
    consequence_to_evaluate: string;
    probability: string;
    severity: string;
};

type AnalysisPayload = {
    probability: string;
    severity: string;
    result: string;
};

interface CreateMitigationPlanAnalysisProps {
    hazardNotification: HazardNotification;
    mode?: "plan-and-analysis" | "analysis-only";
    mitigationPlanId?: number | string;
    initialData?: {
        mitigationPlan?: MitigationPlan | null;
        analysis?: Analysis | null;
    };
    suggestedAnalysis?: Pick<Analysis, "probability" | "severity"> | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const RESPONSIBLE_AREAS = [
    { value: "SMS", label: "Dirección de SMS" },
    { value: "MANTENIMIENTO", label: "Mantenimiento" },
    { value: "TALLER", label: "Taller" },
    { value: "CONTROL_CALIDAD", label: "Control de calidad" },
    { value: "OPERACIONES", label: "Operaciones" },
    { value: "OFICINA", label: "Oficina" },
    { value: "OTROS", label: "Otros" },
];

const PROBABILITY_OPTIONS = [
    { value: "5", label: "Frecuente (5)" },
    { value: "4", label: "Ocasional (4)" },
    { value: "3", label: "Remoto (3)" },
    { value: "2", label: "Improbable (2)" },
    { value: "1", label: "Extremadamente improbable (1)" },
];

const SEVERITY_OPTIONS = [
    { value: "A", label: "Catastrófico (A)" },
    { value: "B", label: "Peligroso (B)" },
    { value: "C", label: "Mayor (C)" },
    { value: "D", label: "Menor (D)" },
    { value: "E", label: "Insignificante (E)" },
];

const parsePossibleConsequences = (value?: string | null) => {
    if (!value) {
        return [];
    }

    const source = value.includes("~") ? value.split("~") : value.split(/\n|,/);

    return Array.from(
        new Set(
            source
                .map((item) => item.trim())
                .filter(Boolean)
        )
    );
};

const serializePossibleConsequences = (items: string[]) => items.join("~");

const getDefaultValues = (
    mitigationPlan: MitigationPlan | null,
    analysis: Analysis | null,
    suggestedAnalysis?: Pick<Analysis, "probability" | "severity"> | null
): FormValues => {
    const parsedConsequences = parsePossibleConsequences(
        mitigationPlan?.possible_consequences
    );
    const selectedConsequenceRaw = (mitigationPlan?.consequence_to_evaluate || "").trim();

    const selectedConsequence =
        parsedConsequences.find((consequence) => consequence.trim() === selectedConsequenceRaw) ||
        (parsedConsequences.length ? parsedConsequences[0] : "");

    return {
        area_responsible: mitigationPlan?.area_responsible || "",
        description: mitigationPlan?.description || "",
        possible_consequences: serializePossibleConsequences(parsedConsequences),
        consequence_to_evaluate: selectedConsequence,
        probability: analysis?.probability || suggestedAnalysis?.probability || "",
        severity: analysis?.severity || suggestedAnalysis?.severity || "",
    };
};

export default function CreateMitigationPlanAnalysis({
    hazardNotification,
    mode = "plan-and-analysis",
    mitigationPlanId,
    initialData,
    suggestedAnalysis,
    onSuccess,
    onCancel,
}: CreateMitigationPlanAnalysisProps) {
    const { selectedCompany } = useCompanyStore();
    const { createMitigationPlan } = useCreateMitigationPlan();
    const { updateMitigationPlan } = useUpdateMitigationPlan();
    const { createMitigationAnalysis } = useCreateMitigationAnalysis();
    const { updateMitigationAnalysis } = useUpdateMitigationAnalysis();
    const mitigationPlan = initialData?.mitigationPlan || null;
    const analysis = initialData?.analysis || null;
    const isAnalysisOnly = mode === "analysis-only";

    const form = useForm<FormValues>({
        resolver: zodResolver(isAnalysisOnly ? ANALYSIS_ONLY_SCHEMA : FORM_SCHEMA),
        defaultValues: getDefaultValues(mitigationPlan, analysis, suggestedAnalysis),
    });

    const [consequenceInput, setConsequenceInput] = useState("");

    useEffect(() => {
        form.reset(getDefaultValues(mitigationPlan, analysis, suggestedAnalysis));
        setConsequenceInput("");
    }, [analysis, form, mitigationPlan, suggestedAnalysis]);

    const watchedProbability = form.watch("probability");
    const watchedSeverity = form.watch("severity");
    const watchedPossibleConsequences = form.watch("possible_consequences");

    const consequenceOptions = useMemo(
        () => parsePossibleConsequences(watchedPossibleConsequences),
        [watchedPossibleConsequences]
    );

    const selectedResult =
        watchedProbability && watchedSeverity ? `${watchedProbability}${watchedSeverity}` : null;
    const selectedRiskLevel = selectedResult ? getResult(selectedResult) : null;

    const syncConsequences = (items: string[]) => {
        const nextSerialized = serializePossibleConsequences(items);
        const selectedConsequence = form.getValues("consequence_to_evaluate");

        form.setValue("possible_consequences", nextSerialized, {
            shouldDirty: true,
            shouldValidate: true,
        });

        form.setValue(
            "consequence_to_evaluate",
            items.includes(selectedConsequence) ? selectedConsequence : items[0] || "",
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        );
    };

    const addConsequence = (rawValue: string) => {
        const cleanedValue = rawValue.trim().replace(/~/g, " ");

        if (!cleanedValue) {
            return;
        }

        if (consequenceOptions.includes(cleanedValue)) {
            setConsequenceInput("");
            return;
        }

        syncConsequences([...consequenceOptions, cleanedValue]);
        setConsequenceInput("");
    };

    const removeConsequence = (valueToRemove: string) => {
        syncConsequences(consequenceOptions.filter((item) => item !== valueToRemove));
    };

    const handleConsequenceInputKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        addConsequence(consequenceInput);
    };

    const handleCellClick = (probability: string, severity: string) => {
        form.setValue("probability", probability, { shouldValidate: true });
        form.setValue("severity", severity, { shouldValidate: true });
    };

    const onSubmit = async (values: FormValues) => {
        const company = selectedCompany?.slug || null;

        const analysisPayload: AnalysisPayload = {
            probability: values.probability,
            severity: values.severity,
            result: `${values.probability}${values.severity}`,
        };

        if (isAnalysisOnly) {
            const targetMitigationPlanId = mitigationPlanId || mitigationPlan?.id;

            if (!targetMitigationPlanId) {
                throw new Error("No se encontró un plan de mitigación para asociar el análisis.");
            }

            if (analysis) {
                await updateMitigationAnalysis.mutateAsync({
                    company,
                    id: analysis.id,
                    data: analysisPayload,
                });
                onSuccess?.();
                return;
            }

            await createMitigationAnalysis.mutateAsync({
                company,
                data: {
                    ...analysisPayload,
                    mitigation_plan_id: targetMitigationPlanId.toString(),
                },
            });
            onSuccess?.();
            return;
        }

        if (mitigationPlan) {
            await updateMitigationPlan.mutateAsync({
                company,
                id: mitigationPlan.id,
                data: {
                    area_responsible: values.area_responsible,
                    description: values.description,
                    possible_consequences: values.possible_consequences,
                    consequence_to_evaluate: values.consequence_to_evaluate,
                },
            });
        } else {
            await createMitigationPlan.mutateAsync({
                company,
                data: {
                    hazard_notification_id: hazardNotification.id.toString(),
                    area_responsible: values.area_responsible,
                    description: values.description,
                    possible_consequences: values.possible_consequences,
                    consequence_to_evaluate: values.consequence_to_evaluate,
                    analysis: analysisPayload,
                },
            });
            onSuccess?.();
            return;
        }

        if (analysis) {
            await updateMitigationAnalysis.mutateAsync({
                company,
                id: analysis.id,
                data: analysisPayload,
            });
            onSuccess?.();
            return;
        }

        await createMitigationAnalysis.mutateAsync({
            company,
            data: {
                ...analysisPayload,
                mitigation_plan_id: mitigationPlan.id.toString(),
            },
        });

        onSuccess?.();
    };

    const isPending =
        createMitigationPlan.isPending ||
        updateMitigationPlan.isPending ||
        createMitigationAnalysis.isPending ||
        updateMitigationAnalysis.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {!isAnalysisOnly && (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="area_responsible"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área responsable</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un área" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {RESPONSIBLE_AREAS.map((area) => (
                                                    <SelectItem key={area.value} value={area.value}>
                                                        {area.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción del plan</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describa el enfoque del plan de mitigación"
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="possible_consequences"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Posibles consecuencias</FormLabel>
                                    <FormControl>
                                        <div className="space-y-3">
                                            <input
                                                type="hidden"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                            <Input
                                                placeholder="Escriba una consecuencia y presione Enter"
                                                value={consequenceInput}
                                                onChange={(event) =>
                                                    setConsequenceInput(event.target.value)
                                                }
                                                onKeyDown={handleConsequenceInputKeyDown}
                                            />

                                            {consequenceOptions.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {consequenceOptions.map((consequence) => (
                                                        <Badge
                                                            key={consequence}
                                                            variant="secondary"
                                                            className="gap-1 px-3 py-1"
                                                        >
                                                            <span>{consequence}</span>
                                                            <button
                                                                type="button"
                                                                className="rounded-full p-0.5 hover:bg-background/60"
                                                                onClick={() =>
                                                                    removeConsequence(consequence)
                                                                }
                                                            >
                                                                <X className="h-3 w-3" />
                                                                <span className="sr-only">
                                                                    Eliminar consecuencia
                                                                </span>
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                                    Todavía no ha agregado consecuencias. Presione
                                                    Enter para registrarlas una por una.
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Cada consecuencia se agrega con Enter y se guarda internamente
                                        separada por <span className="font-mono">~</span>.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="consequence_to_evaluate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Consecuencia a evaluar</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!consequenceOptions.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione una consecuencia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {consequenceOptions.map((consequence) => (
                                                <SelectItem key={consequence} value={consequence}>
                                                    {consequence}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        La consecuencia a evaluar se selecciona de la lista creada
                                        abajo.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="probability"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Probabilidad</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la probabilidad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PROBABILITY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Puede tomar como referencia la evaluación estimada guardada para
                                    la notificación.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Severidad</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la severidad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SEVERITY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <RiskMatrix
                    onCellClick={handleCellClick}
                    selectedProbability={watchedProbability}
                    selectedSeverity={watchedSeverity}
                />

                <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">Selección actual:</span>
                        {selectedResult ? (
                            <>
                                <Badge variant="secondary">Probabilidad {watchedProbability}</Badge>
                                <Badge variant="secondary">Severidad {watchedSeverity}</Badge>
                                <Badge>{selectedResult}</Badge>
                                {selectedRiskLevel && (
                                    <Badge variant="outline">{selectedRiskLevel}</Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">
                                Seleccione probabilidad y severidad para construir el resultado.
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" className="sm:min-w-60" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isAnalysisOnly
                            ? analysis
                                ? "Guardar análisis post mitigación"
                                : "Registrar análisis post mitigación"
                            : mitigationPlan || analysis
                                ? "Guardar cambios"
                                : "Guardar plan y análisis"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
