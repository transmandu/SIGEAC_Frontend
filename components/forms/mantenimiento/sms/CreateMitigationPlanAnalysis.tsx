"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
    useCreateMitigationAnalysis,
    useCreateMitigationPlan,
    useUpdateMitigationAnalysis,
    useUpdateMitigationPlan,
} from "@/actions/mantenimiento/sms/evaluacion_mitigacion/actions";
import RiskMatrix from "@/components/misc/RiskMatrix";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
        .min(3, "Debe indicar las posibles consecuencias"),
    consequence_to_evaluate: z
        .string()
        .min(3, "Debe indicar la consecuencia a evaluar"),
    probability: z.string().min(1, "Seleccione la probabilidad"),
    severity: z.string().min(1, "Seleccione la severidad"),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface CreateMitigationPlanAnalysisProps {
    hazardNotification: HazardNotification;
    mitigationPlan?: MitigationPlan | null;
    analysis?: Analysis | null;
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

const getMitigationPlanId = (response: unknown) => {
    if (!response || typeof response !== "object") {
        return null;
    }

    const planResponse = response as {
        id?: number | string;
        mitigation_plan?: { id?: number | string };
        mitigation_plan_id?: number | string;
    };

    return (
        planResponse.id ??
        planResponse.mitigation_plan?.id ??
        planResponse.mitigation_plan_id ??
        null
    );
};

export default function CreateMitigationPlanAnalysis({
    hazardNotification,
    mitigationPlan,
    analysis,
}: CreateMitigationPlanAnalysisProps) {
    const { selectedCompany } = useCompanyStore();
    const { createMitigationPlan } = useCreateMitigationPlan();
    const { updateMitigationPlan } = useUpdateMitigationPlan();
    const { createMitigationAnalysis } = useCreateMitigationAnalysis();
    const { updateMitigationAnalysis } = useUpdateMitigationAnalysis();

    const form = useForm<FormValues>({
        resolver: zodResolver(FORM_SCHEMA),
        defaultValues: {
            area_responsible: mitigationPlan?.area_responsible || "",
            description: mitigationPlan?.description || "",
            possible_consequences:
                mitigationPlan?.possible_consequences ||
                hazardNotification.possible_consequences ||
                "",
            consequence_to_evaluate:
                mitigationPlan?.consequence_to_evaluate ||
                hazardNotification.consequence_to_evaluate ||
                "",
            probability: analysis?.probability || "",
            severity: analysis?.severity || "",
        },
    });

    useEffect(() => {
        form.reset({
            area_responsible: mitigationPlan?.area_responsible || "",
            description: mitigationPlan?.description || "",
            possible_consequences:
                mitigationPlan?.possible_consequences ||
                hazardNotification.possible_consequences ||
                "",
            consequence_to_evaluate:
                mitigationPlan?.consequence_to_evaluate ||
                hazardNotification.consequence_to_evaluate ||
                "",
            probability: analysis?.probability || "",
            severity: analysis?.severity || "",
        });
    }, [analysis, form, hazardNotification, mitigationPlan]);

    const watchedProbability = form.watch("probability");
    const watchedSeverity = form.watch("severity");

    const handleCellClick = (probability: string, severity: string) => {
        form.setValue("probability", probability, { shouldValidate: true });
        form.setValue("severity", severity, { shouldValidate: true });
    };

    const onSubmit = async (values: FormValues) => {
        const company = selectedCompany?.slug || null;

        let mitigationPlanId = mitigationPlan?.id ?? null;

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
            const response = await createMitigationPlan.mutateAsync({
                company,
                data: {
                    hazard_notification_id: hazardNotification.id,
                    area_responsible: values.area_responsible,
                    description: values.description,
                    possible_consequences: values.possible_consequences,
                    consequence_to_evaluate: values.consequence_to_evaluate,
                },
            });

            mitigationPlanId = getMitigationPlanId(response);
        }

        if (!mitigationPlanId) {
            throw new Error("No se pudo determinar el ID del plan de mitigación");
        }

        const analysisPayload = {
            probability: values.probability,
            severity: values.severity,
            result: `${values.probability}${values.severity}`,
        };

        if (analysis) {
            await updateMitigationAnalysis.mutateAsync({
                company,
                id: analysis.id,
                data: analysisPayload,
            });
            return;
        }

        await createMitigationAnalysis.mutateAsync({
            company,
            data: {
                ...analysisPayload,
                mitigation_plan_id: mitigationPlanId,
            },
        });
    };

    const isPending =
        createMitigationPlan.isPending ||
        updateMitigationPlan.isPending ||
        createMitigationAnalysis.isPending ||
        updateMitigationAnalysis.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="area_responsible"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Área responsable</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un área" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {RESPONSIBLE_AREAS.map((area) => (
                                            <SelectItem
                                                key={area.value}
                                                value={area.value}
                                            >
                                                {area.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <FormControl>
                                    <Textarea
                                        placeholder="Indique la consecuencia principal"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
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
                                <Textarea
                                    placeholder="Liste las posibles consecuencias consideradas"
                                    className="min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Puede ajustar aquí las consecuencias que pasarán al plan.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="probability"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Probabilidad</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la probabilidad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PROBABILITY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la severidad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SEVERITY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
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

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mitigationPlan || analysis
                        ? "Actualizar plan y análisis"
                        : "Guardar plan y análisis"}
                </Button>
            </form>
        </Form>
    );
}
