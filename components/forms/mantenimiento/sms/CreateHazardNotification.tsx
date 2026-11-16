"use client";

import { locationShortLabel } from "@/lib/locations";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hooks & Stores

import { useGetInformationSources } from "@/hooks/sms/useGetInformationSource";
import { useCompanyStore } from "@/stores/CompanyStore";
import { cn } from "@/lib/utils";

import { HazardNotification } from "@/types/sms/mantenimiento";
import {
  UpdateHazardNotification,
  useCreateHazardNotification,
} from "@/actions/mantenimiento/sms/notificacion_peligro/actions";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { InformationSource } from "@/types";
import { useResettingState } from "@/hooks/useResettingState";

const FormSchema = z.object({
  reception_date: z.date({
    error: "La fecha de recepción es obligatoria",
  }),
  identification_area: z.string().min(1, "El área es obligatoria"),
  danger_type: z.string().min(1, "El tipo de peligro es obligatorio"),
  information_source_id: z.string().min(1, "La fuente es obligatoria"),
  description: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  analysis_of_root_causes: z
    .string()
    .min(1, "Debe agregar al menos un análisis"),
  report_type: z.string().min(1, "El tipo de reporte es obligatorio"),
  report_number: z.string().min(1, "El número de reporte es obligatorio"),
  location_id: z.string().min(1, "Seleccione una ubicación"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface FormProps {
  initialData?: HazardNotification;
  isEditing?: boolean;
  reportType: string;
  reportId: string;
}

const AREAS = ["MANTENIMIENTO", "TALLER", "OFICINA", "OTROS"];
const DANGER_TYPES = ["ORGANIZACIONAL", "TECNICO", "HUMANO", "NATURAL"];
const ANALYSIS_SEPARATOR = ", ";
const splitAnalyses = (value?: string | null) =>
  value
    ? value
        .split(/[,~]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className={cn("grid gap-4", className ?? "sm:grid-cols-2")}>
        {children}
      </div>
    </section>
  );
}

export default function CreateHazardNotification({
  reportId,
  isEditing,
  initialData,
  reportType,
}: FormProps) {
  const { selectedCompany } = useCompanyStore();

  const { data: informationSources } = useGetInformationSources();

  const { createHazardNotification } = useCreateHazardNotification();
  const { updateHazardNotification } = UpdateHazardNotification();
  const { data: locations, isLoading: isLocationsLoading } =
    useGetLocationsByCompany(selectedCompany!.slug);

  const [analyses, setAnalyses] = useResettingState<string[]>(
    () => splitAnalyses(initialData?.analysis_of_root_causes),
    [initialData],
  );
  const [newAnalysis, setNewAnalysis] = useState("");

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      reception_date: initialData?.reception_date
        ? new Date(initialData.reception_date)
        : new Date(),
      identification_area: initialData?.identification_area || "",
      danger_type: initialData?.danger_type || "",
      information_source_id:
        initialData?.information_source?.id.toString() || "",
      description: initialData?.description || "",
      analysis_of_root_causes: initialData?.analysis_of_root_causes || "",
      report_type: initialData?.report_type || reportType,
      report_number: initialData?.report_number || "",
      location_id: initialData?.location?.id.toString() || "",
    },
  });

  const descriptionValue =
    useWatch({ control: form.control, name: "description" }) ?? "";

  const syncAnalyses = (list: string[]) => {
    form.setValue("analysis_of_root_causes", list.join(ANALYSIS_SEPARATOR), {
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const handleAnalysisChange = (value: string) => {
    setNewAnalysis(value);
    const pending = value.trim();
    form.setValue(
      "analysis_of_root_causes",
      [...analyses, pending].filter(Boolean).join(ANALYSIS_SEPARATOR),
      { shouldValidate: form.formState.isSubmitted },
    );
  };

  const addAnalysis = () => {
    const value = newAnalysis.trim();
    if (!value) return;

    const updated = [...analyses, value];
    setAnalyses(updated);
    setNewAnalysis("");
    syncAnalyses(updated);
  };

  const removeAnalysis = (index: number) => {
    const pending = newAnalysis.trim();
    const updated = analyses.filter((_, itemIndex) => itemIndex !== index);
    setAnalyses(updated);
    form.setValue(
      "analysis_of_root_causes",
      [...updated, pending].filter(Boolean).join(ANALYSIS_SEPARATOR),
      { shouldValidate: form.formState.isSubmitted },
    );
  };

  const onSubmit = async (values: FormSchemaType) => {
    const mergedAnalyses = newAnalysis.trim()
      ? [...analyses, newAnalysis.trim()]
      : analyses;

    if (!mergedAnalyses.length) {
      form.setError("analysis_of_root_causes", {
        type: "manual",
        message: "Agregue al menos un análisis de causa raíz",
      });
      return;
    }

    try {
      const dataPayload = {
        ...values,
        analysis_of_root_causes: mergedAnalyses.join(ANALYSIS_SEPARATOR),
        voluntary_report_id: reportType === "RVP" ? reportId : undefined,
        obligatory_report_id: reportType === "ROS" ? reportId : undefined,
      };

      if (isEditing && initialData) {
        await updateHazardNotification.mutateAsync({
          company: selectedCompany!.slug,
          data: dataPayload,
          id: initialData.id.toString(),
        });
      } else {
        await createHazardNotification.mutateAsync({
          company: selectedCompany!.slug,
          data: dataPayload,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isPending =
    createHazardNotification.isPending || updateHazardNotification.isPending;
  const analysisError = form.formState.errors.analysis_of_root_causes?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Datos de la notificación">
          <FormField
            control={form.control}
            name="reception_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de recepción</FormLabel>
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
                          : "Seleccione fecha"}
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
            name="report_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de reporte</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 2026-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base donde se genera</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLocationsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLocationsLoading
                            ? "Cargando bases…"
                            : "Seleccionar base"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {locationShortLabel(loc)}
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
            name="information_source_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente de información</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la fuente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {informationSources?.map((source: InformationSource) => (
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

          <FormField
            control={form.control}
            name="identification_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el área" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
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
            name="danger_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de peligro</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DANGER_TYPES.map((dangerType) => (
                      <SelectItem key={dangerType} value={dangerType}>
                        {dangerType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Descripción" className="grid-cols-1">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa la situación de peligro identificada…"
                    rows={5}
                    maxLength={1000}
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between gap-3">
                  <FormMessage />
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {descriptionValue.length}/1000
                  </span>
                </div>
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Causas raíz" className="grid-cols-1">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newAnalysis}
                onChange={(event) => handleAnalysisChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAnalysis();
                  }
                }}
                placeholder="Escriba una causa y presione Enter…"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addAnalysis}
                disabled={!newAnalysis.trim()}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
            </div>

            {analyses.length ? (
              <div className="flex flex-wrap gap-2">
                {analyses.map((analysis, index) => (
                  <span
                    key={`${analysis}-${index}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/50 py-1 pr-1.5 pl-3 text-sm"
                  >
                    <span className="truncate">{analysis}</span>
                    <button
                      type="button"
                      onClick={() => removeAnalysis(index)}
                      aria-label={`Quitar ${analysis}`}
                      className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {analysisError && (
              <p className="text-sm font-medium text-destructive">
                {analysisError}
              </p>
            )}
          </div>
        </FormSection>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Guardar cambios" : "Registrar notificación"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
