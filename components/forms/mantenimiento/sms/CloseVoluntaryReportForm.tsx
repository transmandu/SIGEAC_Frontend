"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, LockKeyhole, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCloseVoluntaryReport } from "@/actions/mantenimiento/sms/reporte_voluntario/actions";
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
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

const FORM_SCHEMA = z.object({
    close_date: z.date({
        required_error: "Seleccione la fecha de cierre",
    }),
    document: z
        .custom<File>((value) => value instanceof File, {
            message: "Adjunte el documento de cierre",
        })
        .refine((file) => file.type === "application/pdf", "Solo se permiten archivos PDF"),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

const DEFAULT_VALUES: Partial<FormValues> = {
    close_date: new Date(),
    document: undefined,
};

type CloseVoluntaryReportFormProps = {
    reportId: number | string;
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default function CloseVoluntaryReportForm({
    reportId,
    onSuccess,
    onCancel,
}: CloseVoluntaryReportFormProps) {
    const { selectedCompany } = useCompanyStore();
    const { closeVoluntaryReport } = useCloseVoluntaryReport();

    const form = useForm<FormValues>({
        resolver: zodResolver(FORM_SCHEMA),
        defaultValues: DEFAULT_VALUES,
    });

    const selectedDocument = form.watch("document");

    const handleCancel = () => {
        form.reset(DEFAULT_VALUES);
        onCancel?.();
    };

    const onSubmit = async (values: FormValues) => {
        await closeVoluntaryReport.mutateAsync({
            company: selectedCompany?.slug || null,
            id: reportId,
            data: {
                close_date: format(values.close_date, "yyyy-MM-dd"),
                document: values.document,
            },
        });

        form.reset(DEFAULT_VALUES);
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="close_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de cierre</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: es })
                                            ) : (
                                                <span>Seleccione una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        fromYear={1980}
                                        toYear={new Date().getFullYear() + 20}
                                        captionLayout="dropdown-buttons"
                                        components={{
                                            Dropdown: (props) => (
                                                <select
                                                    {...props}
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    {props.children}
                                                </select>
                                            ),
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Documento de cierre (PDF)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(event) =>
                                        field.onChange(event.target.files?.[0] || undefined)
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

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={closeVoluntaryReport.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="sm:min-w-52"
                        disabled={closeVoluntaryReport.isPending}
                    >
                        {closeVoluntaryReport.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Paperclip className="mr-2 h-4 w-4" />
                                <LockKeyhole className="mr-2 h-4 w-4" />
                            </>
                        )}
                        Cerrar reporte
                    </Button>
                </div>
            </form>
        </Form>
    );
}
