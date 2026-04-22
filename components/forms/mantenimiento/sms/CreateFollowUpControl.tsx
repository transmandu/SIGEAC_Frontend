"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateFollowUpControl } from "@/actions/mantenimiento/sms/evaluacion_mitigacion/actions";
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
}

export default function CreateFollowUpControl({
    mitigationMeasureId,
}: CreateFollowUpControlProps) {
    const { selectedCompany } = useCompanyStore();
    const { createFollowUpControl } = useCreateFollowUpControl();

    const form = useForm<FormValues>({
        resolver: zodResolver(FORM_SCHEMA),
        defaultValues: {
            description: "",
            date: new Date(),
        },
    });

    useEffect(() => {
        form.reset({
            description: "",
            date: new Date(),
            image: undefined,
            document: undefined,
        });
    }, [form, mitigationMeasureId]);

    const onSubmit = async (values: FormValues) => {
        await createFollowUpControl.mutateAsync({
            company: selectedCompany?.slug || null,
            data: {
                description: values.description,
                date: format(values.date, "yyyy-MM-dd"),
                mitigation_measure_id: mitigationMeasureId,
                image: values.image,
                document: values.document,
            },
        });

        form.reset({
            description: "",
            date: new Date(),
            image: undefined,
            document: undefined,
        });
    };

    const selectedImage = form.watch("image");
    const selectedDocument = form.watch("document");

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
                                {selectedImage && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedImage.name}
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
                                {selectedDocument && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedDocument.name}
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={createFollowUpControl.isPending}
                >
                    {createFollowUpControl.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Paperclip className="mr-2 h-4 w-4" />
                    Agregar control
                </Button>
            </form>
        </Form>
    );
}
