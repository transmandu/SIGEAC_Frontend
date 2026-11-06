"use client";

import { useEffect, useId } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, FileText, ImageIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { FollowUpControl } from "@/types/sms/mantenimiento";

import { FileInput, FormActions, FormSection } from "./_components/form-parts";

const FORM_SCHEMA = z.object({
  description: z.string().min(3, "Describa el control de seguimiento"),
  date: z.date({
    error: "Seleccione la fecha del control",
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

const getDefaultValues = (
  initialData?: FollowUpControl | null,
): FormValues => ({
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

  const selectedImage = useWatch({ control: form.control, name: "image" });
  const selectedDocument = useWatch({
    control: form.control,
    name: "document",
  });
  const imageInputId = useId();
  const documentInputId = useId();
  const isPending =
    createFollowUpControl.isPending || updateFollowUpControl.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Seguimiento">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción del control</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa el seguimiento realizado"
                    className="min-h-25"
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
        </FormSection>

        <FormSection
          title="Evidencias"
          hint="Adjunte una imagen o un PDF si respalda el seguimiento."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={imageInputId}>Imagen adjunta</FormLabel>
                  <FileInput
                    id={imageInputId}
                    accept="image/*"
                    icon={ImageIcon}
                    fileName={selectedImage?.name || initialData?.image}
                    placeholder="Imagen (JPG, PNG…)"
                    onChange={(event) =>
                      field.onChange(event.target.files?.[0] || undefined)
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={documentInputId}>
                    Documento adjunto
                  </FormLabel>
                  <FileInput
                    id={documentInputId}
                    accept="application/pdf"
                    icon={FileText}
                    fileName={selectedDocument?.name || initialData?.document}
                    placeholder="Documento PDF"
                    onChange={(event) =>
                      field.onChange(event.target.files?.[0] || undefined)
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormActions
          onCancel={onCancel}
          submitLabel={isEditing ? "Guardar cambios" : "Agregar control"}
          isPending={isPending}
        />
      </form>
    </Form>
  );
}
