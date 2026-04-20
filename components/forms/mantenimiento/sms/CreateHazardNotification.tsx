"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Hooks & Stores

import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";

// Types
import { HazardNotification } from "@/types/sms/mantenimiento";
import { UpdateHazardNotification, useCreateHazardNotification } from "@/actions/mantenimiento/sms/notificacion_peligro/actions";

const FormSchema = z.object({
    reception_date: z.date({
        required_error: "La fecha de recepción es obligatoria",
    }),
    identification_area: z.string().min(1, "El área es obligatoria"),
    danger_type: z.string().min(1, "El tipo de peligro es obligatorio"),
    information_source_id: z.string().min(1, "La fuente es obligatoria"),
    description: z
        .string()
        .min(3, "Mínimo 3 caracteres")
        .max(1000, "Máximo 1000 caracteres"),
    possible_consequences: z.string().min(1, "Debe agregar al menos una consecuencia"),
    consequence_to_evaluate: z.string().min(1, "Seleccione la consecuencia principal"),
    analysis_of_root_causes: z.string().min(1, "Debe agregar al menos un análisis"),
    report_type: z.string(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
    id: number | string;
    initialData?: HazardNotification;
    isEditing?: boolean;
    reportType: string;
    onClose?: () => void;
}

export default function CreateHazardNotification({
    onClose,
    id,
    isEditing,
    initialData,
    reportType,
}: FormProps) {
    const { selectedCompany } = useCompanyStore();
    const router = useRouter();

    const { data: informationSources, isLoading: isLoadingSources } = useGetInformationSources();

    // Llamada a los hooks según tu archivo de actions
    const { createHazardNotification } = useCreateHazardNotification();
    const { updateHazardNotification } = UpdateHazardNotification();

    const [consequences, setConsequences] = useState<string[]>([]);
    const [newConsequence, setNewConsequence] = useState("");
    const [analyses, setAnalyses] = useState<string[]>([]);
    const [newAnalysis, setNewAnalysis] = useState("");

    const AREAS = ["MANTENIMIENTO", "TALLER", "OFICINA", "OTROS"];
    const DANGER_TYPES = ["ORGANIZACIONAL", "TECNICO", "HUMANO", "NATURAL"];

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            reception_date: initialData?.reception_date ? new Date(initialData.reception_date) : new Date(),
            identification_area: initialData?.identification_area || "",
            danger_type: initialData?.danger_type || "",
            information_source_id: initialData?.information_source?.id.toString() || "",
            description: initialData?.description || "",
            possible_consequences: initialData?.possible_consequences || "",
            consequence_to_evaluate: initialData?.consequence_to_evaluate || "",
            analysis_of_root_causes: initialData?.analysis_of_root_causes || "",
            report_type: reportType || initialData?.report_type || "VOLUNTARIO",
        },
    });

    useEffect(() => {
        if (initialData) {
            const splitStr = (str: string) => str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
            setConsequences(splitStr(initialData.possible_consequences));
            setAnalyses(splitStr(initialData.analysis_of_root_causes));
        }
    }, [initialData]);

    const addConsequence = () => {
        if (newConsequence.trim()) {
            const updated = [...consequences, newConsequence.trim()];
            setConsequences(updated);
            form.setValue("possible_consequences", updated.join(","));
            setNewConsequence("");
        }
    };

    const addAnalysis = () => {
        if (newAnalysis.trim()) {
            const updated = [...analyses, newAnalysis.trim()];
            setAnalyses(updated);
            form.setValue("analysis_of_root_causes", updated.join(","));
            setNewAnalysis("");
        }
    };

    const onSubmit = async (values: FormSchemaType) => {
        try {
            // Preparamos el objeto 'data' tal cual lo pide tu interfaz de Action
            const dataPayload = {
                ...values,
                reception_date: format(values.reception_date, "yyyy-MM-dd"),
            };

            if (isEditing && initialData) {
                await updateHazardNotification.mutateAsync({
                    company: selectedCompany?.slug || null,
                    id: initialData.id,
                    data: dataPayload,
                });
                onClose?.();
            } else {
                const response = await createHazardNotification.mutateAsync({
                    company: selectedCompany?.slug || null,
                    id: id, // ID del reporte padre
                    reportType: reportType,
                    data: dataPayload,
                });

                if (response?.danger_identification_id) {
                    router.push(`/${selectedCompany?.slug}/sms/gestion_reportes/peligros_identificados/${response.danger_identification_id}`);
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const isPending = createHazardNotification.isPending || updateHazardNotification.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
                <h2 className="text-lg font-bold text-center">Identificación de Peligro</h2>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha */}
                    <FormField
                        control={form.control}
                        name="reception_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha de Recepción</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccione fecha"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Fuente de Información */}
                    <FormField
                        control={form.control}
                        name="information_source_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fuente de Información</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione fuente" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {informationSources?.map((source: any) => (
                                            <SelectItem key={source.id} value={source.id.toString()}>
                                                {source.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Área */}
                    <FormField
                        control={form.control}
                        name="identification_area"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Área</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tipo Peligro */}
                    <FormField
                        control={form.control}
                        name="danger_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Peligro</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {DANGER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                            <FormLabel>Descripción del Peligro</FormLabel>
                            <FormControl><Textarea {...field} placeholder="Detalle el peligro identificado..." /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Consecuencias Tags */}
                <div className="space-y-2">
                    <FormLabel>Posibles Consecuencias</FormLabel>
                    <div className="flex gap-2">
                        <Input value={newConsequence} onChange={(e) => setNewConsequence(e.target.value)} placeholder="Añadir..." />
                        <Button type="button" onClick={addConsequence} size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {consequences.map((c, i) => (
                            <div key={i} className="flex items-center gap-1 bg-secondary p-1 px-2 rounded-md text-sm">
                                {c} <X className="h-3 w-3 cursor-pointer" onClick={() => {
                                    const up = consequences.filter((_, idx) => idx !== i);
                                    setConsequences(up);
                                    form.setValue("possible_consequences", up.join(","));
                                }} />
                            </div>
                        ))}
                    </div>
                    {form.formState.errors.possible_consequences && <p className="text-destructive text-sm">{form.formState.errors.possible_consequences.message}</p>}
                </div>

                {/* Consecuencia a Evaluar */}
                <FormField
                    control={form.control}
                    name="consequence_to_evaluate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Consecuencia Principal a Evaluar</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione de la lista" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {consequences.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Análisis Tags */}
                <div className="space-y-2">
                    <FormLabel>Análisis de Causas Raíz</FormLabel>
                    <div className="flex gap-2">
                        <Input value={newAnalysis} onChange={(e) => setNewAnalysis(e.target.value)} placeholder="Añadir análisis..." />
                        <Button type="button" onClick={addAnalysis} size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-col gap-1">
                        {analyses.map((a, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted p-2 rounded-md text-sm">
                                {a} <X className="h-4 w-4 cursor-pointer" onClick={() => {
                                    const up = analyses.filter((_, idx) => idx !== i);
                                    setAnalyses(up);
                                    form.setValue("analysis_of_root_causes", up.join(","));
                                }} />
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Actualizar Identificación" : "Registrar Identificación"}
                </Button>
            </form>
        </Form>
    );
}
