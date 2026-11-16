"use client";

import { useId } from "react";
import { zodResolver } from "@/lib/zod-resolver";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, FileText } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

import { FileInput, FormActions } from "./_components/form-parts";

const FORM_SCHEMA = z.object({
  close_date: z.date({
    error: "Seleccione la fecha de cierre",
  }),
  management_doc: z
    .custom<File>((value) => value instanceof File, {
      message: "Adjunte el documento de cierre",
    })
    .refine(
      (file) => file.type === "application/pdf",
      "Solo se permiten archivos PDF",
    ),
});

type FormValues = z.infer<typeof FORM_SCHEMA>;

const DEFAULT_VALUES: Partial<FormValues> = {
  close_date: new Date(),
  management_doc: undefined,
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

  const selectedDocument = useWatch({
    control: form.control,
    name: "management_doc",
  });
  const documentInputId = useId();

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
        management_doc: values.management_doc,
      },
    });

    form.reset(DEFAULT_VALUES);
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        "w-full justify-start pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                      {field.value
                        ? format(field.value, "PPP", { locale: es })
                        : "Seleccione una fecha"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    autoFocus
                    startMonth={new Date(1980, 0)}
                    endMonth={new Date(new Date().getFullYear() + 20, 11)}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="management_doc"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={documentInputId}>
                Documento de gestión (PDF)
              </FormLabel>
              <FileInput
                id={documentInputId}
                accept="application/pdf"
                icon={FileText}
                fileName={selectedDocument?.name}
                placeholder="Adjuntar el PDF de cierre"
                onChange={(event) =>
                  field.onChange(event.target.files?.[0] || undefined)
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormActions
          onCancel={handleCancel}
          submitLabel="Cerrar reporte"
          isPending={closeVoluntaryReport.isPending}
        />
      </form>
    </Form>
  );
}
