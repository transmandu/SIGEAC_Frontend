"use client";

import { useMemo } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2, Plane, Plus, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetDirectiveControls } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControls";
import { useCreateDirectiveControl, useUpdateDirectiveControl } from "@/actions/mantenimiento/planificacion/control_directivas/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import { DirectiveApplicability, DirectiveAuthority, DirectiveComplianceType, DirectiveControl } from "@/types";
import { DIRECTIVE_APPLICABILITY_LABELS, DIRECTIVE_AUTHORITY_LABELS, DIRECTIVE_COMPLIANCE_TYPE_LABELS } from "@/lib/directiveControlLabels";
import { FormSection, fieldClass, hintClass, labelClass, selectTriggerClass } from "./_theme";
import {
  AircraftSelect,
  CatalogManualField,
  CompactDateField,
  FUSELAGE,
  NumericInput,
  ParentOption,
  ProviderSelect,
  useParentOptions,
} from "./_shared";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" };

const countingMethodEnum = z.enum(ALL_COUNTING_METHODS);
const authorityEnum = z.enum(Object.keys(DIRECTIVE_AUTHORITY_LABELS) as [string, ...string[]]);
const applicabilityEnum = z.enum(Object.keys(DIRECTIVE_APPLICABILITY_LABELS) as [string, ...string[]]);
const complianceTypeEnum = z.enum(Object.keys(DIRECTIVE_COMPLIANCE_TYPE_LABELS) as [string, ...string[]]);

const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

const intervalSchema = z.object({
  id: z.number().optional(),
  counting_method: countingMethodEnum,
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  initial_value: optionalNumeric,
});

const itemSchema = z.object({
  id: z.number().optional(),
  parent_aircraft_part_id: z.string().default(FUSELAGE),
  ad_number: z.string().min(1, "Requerido"),
  authority: authorityEnum,
  revision: z.string().optional(),
  description: z.string().min(1, "Requerido"),
  reference_document: z.string().optional(),
  compliance_method: z.string().optional(),
  applicability: applicabilityEnum,
  applicability_notes: z.string().optional(),
  compliance_type: complianceTypeEnum,
  maintenance_provider_id: z.string().optional(),
  first_applied_date: z.date().optional(),
  observations: z.string().optional(),
  intervals: z.array(intervalSchema).default([]),
});

// Mismas reglas cruzadas que StoreDirectiveControlRequest: el motivo es
// obligatorio al descartar una AD; la fecha e intervalos solo si aplica.
const formSchema = z
  .object({
    aircraft_id: z.string().min(1, "Seleccione una aeronave"),
    title: z.string().min(1, "Ingrese un título"),
    description: z.string().optional(),
    has_reference_manual: z.boolean().default(false),
    reference_manual: z.string().optional(),
    maintenance_catalog_manual_id: z.number().optional(),
    remaining_percentage: z.coerce.number().min(0, "Debe ser ≥ 0").max(100, "Debe ser ≤ 100"),
    items: z.array(itemSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.has_reference_manual && !vals.reference_manual?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique el manual de referencia", path: ["reference_manual"] });
    }

    vals.items.forEach((item, index) => {
      const path = ["items", index];

      if ((item.applicability === "NOT_APPLICABLE" || item.applicability === "SUPERSEDED") && !item.applicability_notes?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: item.applicability === "SUPERSEDED" ? "Indique qué AD la supersede" : "Indique el motivo (por modelo, por serial, por modificación...)",
          path: [...path, "applicability_notes"],
        });
      }

      if (item.applicability !== "APPLICABLE") return;

      const isRecurrent = item.compliance_type === "RECURRENT";
      if (isRecurrent && !item.first_applied_date) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique la fecha del último cumplimiento", path: [...path, "first_applied_date"] });
      }
      if (isRecurrent && item.intervals.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Una AD recurrente necesita al menos un intervalo", path: [...path, "intervals"] });
      }
      if (!isRecurrent && item.intervals.length > 0 && !item.first_applied_date) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique la fecha de referencia desde la que corre el plazo", path: [...path, "first_applied_date"] });
      }

      const seen = new Set<string>();
      item.intervals.forEach((interval, i) => {
        if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique las horas/ciclos del conjunto en la fecha de referencia",
            path: [...path, "intervals", i, "initial_value"],
          });
        }
        if (seen.has(interval.counting_method)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "No puede repetir la misma unidad", path: [...path, "intervals", i, "counting_method"] });
        }
        seen.add(interval.counting_method);
      });
    });
  });

type FormValues = z.infer<typeof formSchema>;

const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (["HOURS", "CYCLES", "DAYS"].find((m) => !usedMethods.includes(m)) ?? "HOURS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

const emptyItem = () => ({
  parent_aircraft_part_id: FUSELAGE,
  ad_number: "",
  authority: "FAA",
  revision: "",
  description: "",
  reference_document: "",
  compliance_method: "",
  applicability: "PENDING_ANALYSIS",
  applicability_notes: "",
  compliance_type: "ONE_TIME",
  maintenance_provider_id: "",
  first_applied_date: undefined as unknown as Date,
  observations: "",
  intervals: [] as ReturnType<typeof emptyInterval>[],
});

function SelectField({
  control,
  name,
  label,
  options,
}: {
  control: Control<any>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className={labelClass}>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined}>
            <FormControl>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Seleccione..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
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
  );
}

function TextField({
  control,
  name,
  label,
  placeholder,
  optional,
  className,
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  className?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1", className)}>
          <FormLabel className={labelClass}>
            {label}
            {optional && <span className="ml-1 text-xs text-muted-foreground">(Opcional)</span>}
          </FormLabel>
          <FormControl>
            <Input placeholder={placeholder} className={fieldClass} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function IntervalRow({
  control,
  namePrefix,
  usedMethods,
  onRemove,
}: {
  control: Control<any>;
  namePrefix: string;
  usedMethods: string[];
  onRemove: () => void;
}) {
  const countingMethod = useWatch({ control, name: `${namePrefix}.counting_method` });
  const isDays = countingMethod === "DAYS";
  const unitShort = countingMethod === "HOURS" ? "hrs" : countingMethod === "CYCLES" ? "cic" : "días";

  return (
    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[110px_1fr_1fr_32px]">
      <FormField
        control={control}
        name={`${namePrefix}.counting_method`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>Unidad</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ALL_COUNTING_METHODS.filter((unit) => unit === field.value || !usedMethods.includes(unit)).map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {COUNTING_METHOD_LABEL[unit]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.limit_value`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>Plazo ({unitShort})</FormLabel>
            <FormControl>
              <NumericInput placeholder="0" className={fieldClass} value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isDays ? (
        <div className="space-y-1">
          <p className={labelClass}>Lectura del conjunto</p>
          <div className={cn(fieldClass, "flex items-center justify-center text-sm text-muted-foreground/40 shadow-none")}>—</div>
        </div>
      ) : (
        <FormField
          control={control}
          name={`${namePrefix}.initial_value`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className={labelClass}>Conjunto en la referencia ({unitShort})</FormLabel>
              <FormControl>
                <NumericInput placeholder="0" className={fieldClass} value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Quitar intervalo" className="h-11 w-8 shrink-0 text-muted-foreground/70 hover:text-destructive">
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

function DirectiveCard({
  control,
  index,
  parentOptions,
  onRemove,
}: {
  control: Control<any>;
  index: number;
  parentOptions: ParentOption[];
  onRemove: () => void;
}) {
  const namePrefix = `items.${index}`;
  const adNumber = useWatch({ control, name: `${namePrefix}.ad_number` }) as string;
  const applicability = useWatch({ control, name: `${namePrefix}.applicability` }) as DirectiveApplicability;
  const complianceType = useWatch({ control, name: `${namePrefix}.compliance_type` }) as DirectiveComplianceType;
  const { fields, append, remove } = useFieldArray({ control, name: `${namePrefix}.intervals` });
  const intervals = (useWatch({ control, name: `${namePrefix}.intervals` }) as { counting_method: string }[]) ?? [];
  const usedMethods = intervals.map((i) => i.counting_method).filter(Boolean);

  const isApplicable = applicability === "APPLICABLE";
  const needsNotes = applicability === "NOT_APPLICABLE" || applicability === "SUPERSEDED";
  const isRecurrent = complianceType === "RECURRENT";

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          <span className="text-muted-foreground">#{index + 1}</span> {adNumber || "Nueva directiva"}
        </p>
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="size-8 text-muted-foreground/70 hover:text-destructive">
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quitar directiva</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_110px_1fr]">
        <TextField control={control} name={`${namePrefix}.ad_number`} label="N° de AD" placeholder="EJ: 2019-05-04" />
        <SelectField
          control={control}
          name={`${namePrefix}.authority`}
          label="Autoridad"
          options={Object.entries(DIRECTIVE_AUTHORITY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField control={control} name={`${namePrefix}.revision`} label="Revisión" placeholder="R1" optional />
        <SelectField
          control={control}
          name={`${namePrefix}.parent_aircraft_part_id`}
          label="Conjunto afectado"
          options={parentOptions.map((o) => ({ value: o.id, label: o.label }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
        <TextField control={control} name={`${namePrefix}.description`} label="Asunto" placeholder="EJ: Inspección de tren de aterrizaje principal" />
        <TextField control={control} name={`${namePrefix}.reference_document`} label="Documento de referencia" placeholder="EJ: SB 407-32-101" optional />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr]">
        <SelectField
          control={control}
          name={`${namePrefix}.applicability`}
          label="Aplicabilidad"
          options={Object.entries(DIRECTIVE_APPLICABILITY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <SelectField
          control={control}
          name={`${namePrefix}.compliance_type`}
          label="Tipo de cumplimiento"
          options={Object.entries(DIRECTIVE_COMPLIANCE_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField control={control} name={`${namePrefix}.compliance_method`} label="Método de cumplimiento" placeholder="EJ: Inspección visual párrafo (e)" optional />
      </div>

      {needsNotes && (
        <TextField
          control={control}
          name={`${namePrefix}.applicability_notes`}
          label={applicability === "SUPERSEDED" ? "Supersedida por" : "Motivo de no aplicabilidad"}
          placeholder={applicability === "SUPERSEDED" ? "EJ: AD 2021-12-08" : "EJ: Por serial — aplica a S/N 53000 a 53999"}
        />
      )}

      {isApplicable && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
            <div className="space-y-1">
              <p className={labelClass}>
                Realizado por{!isRecurrent && <span className="ml-1 text-xs font-normal text-muted-foreground">(Opcional)</span>}
              </p>
              <ProviderSelect control={control} name={`${namePrefix}.maintenance_provider_id`} />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>{isRecurrent ? "Último cumplimiento" : "Fecha de referencia"}</p>
              <CompactDateField control={control} name={`${namePrefix}.first_applied_date`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={labelClass}>
                {isRecurrent ? "Intervalos" : "Plazo para cumplir"}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {isRecurrent ? "(varios = lo que ocurra primero)" : "(vacío si ya se cumplió o no tiene plazo)"}
                </span>
              </p>
              {fields.length < ALL_COUNTING_METHODS.length && (
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyInterval(usedMethods))} className="gap-1.5 border-dashed text-muted-foreground hover:text-primary">
                  <Plus className="size-3.5" />
                  Agregar {isRecurrent ? "intervalo" : "plazo"}
                </Button>
              )}
            </div>
            {fields.map((field, i) => (
              <IntervalRow key={field.id} control={control} namePrefix={`${namePrefix}.intervals.${i}`} usedMethods={usedMethods} onRemove={() => remove(i)} />
            ))}
            <FormField control={control} name={`${namePrefix}.intervals`} render={() => <FormMessage />} />
          </div>
        </>
      )}

      <FormField
        control={control}
        name={`${namePrefix}.observations`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>
              Observaciones <span className="text-xs text-muted-foreground">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea placeholder="..." className={cn(fieldClass, "h-auto min-h-9 resize-none py-2")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function mapToFormItem(item: NonNullable<DirectiveControl["items"]>[number]) {
  return {
    id: item.id,
    parent_aircraft_part_id: item.parent_aircraft_part_id ? String(item.parent_aircraft_part_id) : FUSELAGE,
    ad_number: item.ad_number,
    authority: item.authority,
    revision: item.revision ?? "",
    description: item.description,
    reference_document: item.reference_document ?? "",
    compliance_method: item.compliance_method ?? "",
    applicability: item.applicability,
    applicability_notes: item.applicability_notes ?? "",
    compliance_type: item.compliance_type,
    maintenance_provider_id: item.maintenance_provider_id ? String(item.maintenance_provider_id) : "",
    first_applied_date: item.first_applied_date ? parseISO(item.first_applied_date) : undefined,
    observations: item.observations ?? "",
    intervals: item.intervals.map((interval) => ({
      id: interval.id,
      counting_method: interval.counting_method,
      limit_value: Number(interval.limit_value),
      initial_value: interval.initial_value != null ? Number(interval.initial_value) : undefined,
    })),
  };
}

const emptyFormValues: FormValues = {
  aircraft_id: "",
  title: "",
  description: "",
  has_reference_manual: false,
  reference_manual: "",
  maintenance_catalog_manual_id: undefined,
  remaining_percentage: 15,
  items: [],
};

function buildDefaultValues(initialData?: DirectiveControl): FormValues {
  if (!initialData) return emptyFormValues;

  return {
    aircraft_id: String(initialData.aircraft_id),
    title: initialData.title,
    description: initialData.description ?? "",
    has_reference_manual: initialData.has_reference_manual,
    reference_manual: initialData.reference_manual ?? "",
    maintenance_catalog_manual_id: initialData.maintenance_catalog_manual_id ? Number(initialData.maintenance_catalog_manual_id) : undefined,
    remaining_percentage: Number(initialData.remaining_percentage),
    items: (initialData.items ?? []).map(mapToFormItem),
  };
}

export default function CreateDirectiveControlForm({ initialData }: { initialData?: DirectiveControl }) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const { createDirectiveControl } = useCreateDirectiveControl();
  const { updateDirectiveControl } = useUpdateDirectiveControl();
  const { data: directiveControls } = useGetDirectiveControls(selectedCompany?.slug);

  const excludeAircraftIds = useMemo(
    () => (directiveControls ?? []).filter((c) => c.id !== initialData?.id).map((c) => String(c.aircraft_id)),
    [directiveControls, initialData?.id],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  // Mismo cast que los otros formularios de control (react-hook-form 7.87).
  const control = form.control as unknown as Control<any>;

  const hasReferenceManual = form.watch("has_reference_manual");
  const aircraftId = form.watch("aircraft_id");
  const parentOptions = useParentOptions(aircraftId);
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      aircraft_id: values.aircraft_id,
      title: values.title,
      description: values.description,
      has_reference_manual: values.has_reference_manual ?? false,
      reference_manual: values.reference_manual,
      maintenance_catalog_manual_id: values.maintenance_catalog_manual_id,
      remaining_percentage: values.remaining_percentage,
      items: values.items.map((item) => {
        const applicable = item.applicability === "APPLICABLE";
        return {
          id: item.id,
          parent_aircraft_part_id: item.parent_aircraft_part_id === FUSELAGE ? null : Number(item.parent_aircraft_part_id),
          ad_number: item.ad_number,
          authority: item.authority as DirectiveAuthority,
          revision: item.revision || undefined,
          description: item.description,
          reference_document: item.reference_document || undefined,
          compliance_method: item.compliance_method || undefined,
          applicability: item.applicability as DirectiveApplicability,
          applicability_notes: item.applicability_notes || undefined,
          compliance_type: item.compliance_type as DirectiveComplianceType,
          maintenance_provider_id: applicable ? item.maintenance_provider_id || undefined : undefined,
          first_applied_date: applicable && item.first_applied_date ? format(item.first_applied_date, "yyyy-MM-dd") : undefined,
          observations: item.observations || undefined,
          intervals: applicable
            ? item.intervals.map((interval) => ({
                counting_method: interval.counting_method,
                limit_value: interval.limit_value,
                initial_value: interval.initial_value,
              }))
            : [],
        };
      }),
    };

    if (isEditing) {
      await updateDirectiveControl.mutateAsync({ id: initialData.id, company: selectedCompany!.slug, data: payload });
    } else {
      await createDirectiveControl.mutateAsync({ company: selectedCompany!.slug, data: payload });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_directivas`);
  };

  const isPending = createDirectiveControl.isPending || updateDirectiveControl.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
        }}
        className="flex flex-col gap-6"
      >
        <FormSection icon={ClipboardList} title="Datos Básicos" hint="Aeronave, título y a partir de qué remanente se avisa." action={<CreateMaintenanceProviderDialog />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AircraftSelect control={control} name="aircraft_id" excludeIds={excludeAircraftIds} hint="Solo se listan las que aún no tienen un control de directivas." />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Control de Directivas YV2272" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="remaining_percentage"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>% de Remanente para Alerta</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumericInput className={cn(fieldClass, "pr-8")} value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription className={hintClass}>Con cuánto remanente sobre el plazo se avisa que una AD está próxima a vencer.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full md:col-span-2">
                  <FormLabel className={labelClass}>
                    Descripción <span className="text-xs text-muted-foreground">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." className={cn(fieldClass, "h-auto resize-none py-2")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="has_reference_manual"
              render={({ field }) => (
                <FormItem className={cn(fieldClass, "h-auto shadow-none md:col-span-2 flex flex-row items-start space-x-3 space-y-0 p-4 hover:shadow-none")}>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={labelClass}>¿Tiene manual de referencia?</FormLabel>
                    <FormDescription className={hintClass}>Indique si este control se basa en un manual específico.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {hasReferenceManual && (
              <>
                <CatalogManualField control={control} aircraftId={aircraftId} />
                <FormField
                  control={control}
                  name="reference_manual"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>Manual de Referencia</FormLabel>
                      <FormControl>
                        <Input placeholder="EJ: Listado AD FAA / RAV 39" className={fieldClass} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </FormSection>

        {aircraftId ? (
          <FormSection icon={ShieldAlert} title="Directivas de Aeronavegabilidad" hint="Cada AD evaluada, aplique o no: las descartadas quedan con su motivo; las aplicables llevan fecha, método y plazo.">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <DirectiveCard key={field.id} control={control} index={index} parentOptions={parentOptions} onRemove={() => remove(index)} />
              ))}
              {fields.length === 0 && <p className={cn(hintClass, "italic")}>Agregue las AD evaluadas para esta aeronave y sus conjuntos.</p>}
              <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem())} className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary">
                <Plus className="size-3.5" />
                Agregar directiva
              </Button>
            </div>
          </FormSection>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/50 bg-muted/20 p-8 text-center dark:border-slate-600/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">Seleccione una aeronave para continuar</p>
          </div>
        )}

        <Button
          className="h-11 gap-2 self-end rounded-lg bg-gradient-to-br from-primary to-primary/85 px-6 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <p>{isEditing ? "Guardar Cambios" : "Crear Control de Directivas"}</p>}
        </Button>
      </form>
    </Form>
  );
}
