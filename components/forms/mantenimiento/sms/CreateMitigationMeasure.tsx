"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    useCreateMitigationMeasure,
    useUpdateMitigationMeasure,
} from "@/actions/mantenimiento/sms/evaluacion_mitigacion/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MitigationMeasure } from "@/types/sms/mantenimiento";

const FORM_SCHEMA = z.object({
    description: z.string().min(3, "Describa la medida de mitigación"),
    implementation_responsible: z
        .string()
        .min(3, "Indique quién implementa la medida"),
    implementation_supervisor: z
        .string()
        .min(3, "Indique quién supervisa la medida"),
    estimated_date: z.date({
        required_error: "Seleccione la fecha estimada",
    }),
    execution_date: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface CreateMitigationMeasureProps {
    mitigationPlanId: number | string;
    initialData?: MitigationMeasure | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const getDefaultValues = (initialData?: MitigationMeasure | null): FormValues => ({
    description: initialData?.description || "",
    implementation_responsible: initialData?.implementation_responsible || "",
    implementation_supervisor: initialData?.implementation_supervisor || "",
    estimated_date: initialData?.estimated_date ? new Date(initialData.estimated_date) : new Date(),
    execution_date: initialData?.execution_date ? new Date(initialData.execution_date) : null,
});

export default function CreateMitigationMeasure({
    mitigationPlanId,
    initialData,
    onSuccess,
    onCancel,
}: CreateMitigationMeasureProps) {
    const { selectedCompany } = useCompanyStore();
    const { createMitigationMeasure } = useCreateMitigationMeasure();
    const { updateMitigationMeasure } = useUpdateMitigationMeasure();
    const isEditing = Boolean(initialData);

    const form = useForm<FormValues>({
        resolver: zodResolver(FORM_SCHEMA),
        defaultValues: getDefaultValues(initialData),
    });

    useEffect(() => {
        form.reset(getDefaultValues(initialData));
    }, [form, initialData, mitigationPlanId]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            description: values.description,
            implementation_responsible: values.implementation_responsible,
            implementation_supervisor: values.implementation_supervisor,
            estimated_date: format(values.estimated_date, "yyyy-MM-dd"),
            execution_date: values.execution_date
                ? format(values.execution_date, "yyyy-MM-dd")
                : undefined,
        };

        if (isEditing && initialData) {
            await updateMitigationMeasure.mutateAsync({
                company: selectedCompany!.slug,
                id: initialData.id,
                data: payload,
            });
        } else {
            await createMitigationMeasure.mutateAsync({
                company: selectedCompany!.slug,
                data: {
                    ...payload,
                    mitigation_plan_id: mitigationPlanId.toString(),
                },
            });
        }

        form.reset(getDefaultValues(initialData));
        onSuccess?.();
    };

    const isPending =
        createMitigationMeasure.isPending || updateMitigationMeasure.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción de la medida</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detalle la medida de mitigación a implementar"
                                    className="min-h-[110px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="implementation_responsible"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Responsable de implementación</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nombre o área responsable"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="implementation_supervisor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supervisor de seguimiento</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nombre o área que supervisa"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="estimated_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha estimada</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", {
                                                        locale: es,
                                                    })
                                                ) : (
                                                    <span>Seleccione una fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="execution_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha de ejecución</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", {
                                                        locale: es,
                                                    })
                                                ) : (
                                                    <span>Opcional</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value || undefined}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                    <Button type="submit" className="sm:min-w-52" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Guardar cambios" : "Agregar medida"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
