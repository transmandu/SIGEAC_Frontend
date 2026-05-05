"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    useCreateFollowUpControl,
    useUpdateFollowUpControl,
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
import { FollowUpControl } from "@/types/sms/mantenimiento";

const FORM_SCHEMA = z.object({
    description: z.string().min(3, "Describa el control de seguimiento"),
    date: z.date({
        required_error: "Seleccione la fecha del control",
    }),
    image: z.instanceof(File).optional(),
    document: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

interface CreateFollowUpControlProps {
    mitigationMeasureId: number | string;
    initialData?: FollowUpControl | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const getDefaultValues = (initialData?: FollowUpControl | null): FormValues => ({
    description: initialData?.description || "",
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    image: undefined,
    document: undefined,
});

export default function CreateFollowUpControl({
    mitigationMeasureId,
    initialData,
    onSuccess,
    onCancel,
}: CreateFollowUpControlProps) {
    const { selectedCompany } = useCompanyStore();
    const { createFollowUpControl } = useCreateFollowUpControl();
    const { updateFollowUpControl } = useUpdateFollowUpControl();
    const isEditing = Boolean(initialData);

    const form = useForm<FormValues>({
        resolver: zodResolver(FORM_SCHEMA),
        defaultValues: getDefaultValues(initialData),
    });

    useEffect(() => {
        form.reset(getDefaultValues(initialData));
    }, [form, initialData, mitigationMeasureId]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            description: values.description,
            date: format(values.date, "yyyy-MM-dd"),
            mitigation_measure_id: mitigationMeasureId.toString(),
            image: values.image,
            document: values.document,
        };

        if (isEditing && initialData) {
            await updateFollowUpControl.mutateAsync({
                company: selectedCompany?.slug || null,
                id: initialData.id,
                data: payload,
            });
        } else {
            await createFollowUpControl.mutateAsync({
                company: selectedCompany?.slug || null,
                data: payload,
            });
        }

        form.reset(getDefaultValues(initialData));
        onSuccess?.();
    };

    const selectedImage = form.watch("image");
    const selectedDocument = form.watch("document");
    const isPending =
        createFollowUpControl.isPending || updateFollowUpControl.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción del control</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describa el seguimiento realizado"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha del seguimiento</FormLabel>
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

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Imagen adjunta</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                            field.onChange(
                                                event.target.files?.[0] || undefined
                                            )
                                        }
                                    />
                                </FormControl>
                                {(selectedImage || initialData?.image) && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedImage?.name || initialData?.image}
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="document"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Documento adjunto</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(event) =>
                                            field.onChange(
                                                event.target.files?.[0] || undefined
                                            )
                                        }
                                    />
                                </FormControl>
                                {(selectedDocument || initialData?.document) && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedDocument?.name || initialData?.document}
                                    </p>
                                )}
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
                        <Paperclip className="mr-2 h-4 w-4" />
                        {isEditing ? "Guardar cambios" : "Agregar control"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
