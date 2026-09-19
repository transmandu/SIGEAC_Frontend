"use client";

import { useMemo } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardList, Loader2, Plane, Plus, Radio, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import { useCreateAvionicsControl, useUpdateAvionicsControl } from "@/actions/mantenimiento/planificacion/control_avionica/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import { AvionicsAction, AvionicsCategory, AvionicsControl } from "@/types";
import { AVIONICS_ACTION_LABELS, AVIONICS_CATEGORY_LABELS } from "@/lib/avionicsControlLabels";
import { FormSection, fieldClass, hintClass, labelClass, selectTriggerClass } from "./_theme";
import { AircraftSelect, CatalogManualField, CompactDateField, NumericInput, ProviderSelect } from "./_shared";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" };

const countingMethodEnum = z.enum(ALL_COUNTING_METHODS);
const categoryEnum = z.enum(Object.keys(AVIONICS_CATEGORY_LABELS) as [string, ...string[]]);
const actionEnum = z.enum(Object.keys(AVIONICS_ACTION_LABELS) as [string, ...string[]]);

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

// Una tarea por condición no lleva fecha, proveedor ni intervalos; una
// programada exige los tres (ver superRefine).
const taskSchema = z.object({
  id: z.number().optional(),
  action: actionEnum,
  is_on_condition: z.boolean().default(false),
  maintenance_provider_id: z.string().optional(),
  first_applied_date: z.date().optional(),
  intervals: z.array(intervalSchema).default([]),
});

const itemSchema = z.object({
  id: z.number().optional(),
  category: categoryEnum,
  is_hazardous: z.boolean().default(false),
  description: z.string().min(1, "Requerido"),
  part_number: z.string().min(1, "Requerido"),
  serial: z.string().min(1, "Requerido"),
  position: z.string().optional(),
  reference_document: z.string().optional(),
  tasks: z.array(taskSchema).min(1, "Agregue al menos una tarea"),
});

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
      item.tasks.forEach((task, t) => {
        if (task.is_on_condition) return;
        const path = ["items", index, "tasks", t];

        if (!task.first_applied_date) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique la fecha del último evento", path: [...path, "first_applied_date"] });
        }
        if (!task.maintenance_provider_id) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique quién la realizó", path: [...path, "maintenance_provider_id"] });
        }
        if (task.intervals.length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Agregue al menos un intervalo o marque la tarea por condición", path: [...path, "intervals"] });
        }

        const seen = new Set<string>();
        task.intervals.forEach((interval, i) => {
          if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique las horas/ciclos de la aeronave en ese evento",
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
  });

type FormValues = z.infer<typeof formSchema>;

// Casi todo plazo de aviónica es calendario: la unidad nace en DAYS.
const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (["DAYS", "HOURS", "CYCLES"].find((m) => !usedMethods.includes(m)) ?? "DAYS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

const emptyTask = () => ({
  action: "FUNCTIONAL_CHECK",
  is_on_condition: true,
  maintenance_provider_id: "",
  first_applied_date: undefined as unknown as Date,
  intervals: [] as ReturnType<typeof emptyInterval>[],
});

const emptyItem = () => ({
  category: "OTHER",
  is_hazardous: false,
  description: "",
  part_number: "",
  serial: "",
  position: "",
  reference_document: "",
  tasks: [emptyTask()],
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
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
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
            <FormLabel className={labelClass}>Límite ({unitShort})</FormLabel>
            <FormControl>
              <NumericInput placeholder="0" className={fieldClass} value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {isDays ? (
        <div className="space-y-1">
          <p className={labelClass}>Lectura aeronave</p>
          <div className={cn(fieldClass, "flex items-center justify-center text-sm text-muted-foreground/40 shadow-none")}>—</div>
        </div>
      ) : (
        <FormField
          control={control}
          name={`${namePrefix}.initial_value`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className={labelClass}>Aeronave al evento ({unitShort})</FormLabel>
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

function TaskCard({
  control,
  namePrefix,
  onRemove,
  canRemove,
}: {
  control: Control<any>;
  namePrefix: string;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isOnCondition = useWatch({ control, name: `${namePrefix}.is_on_condition` }) as boolean;
  const { fields, append, remove } = useFieldArray({ control, name: `${namePrefix}.intervals` });
  const intervals = (useWatch({ control, name: `${namePrefix}.intervals` }) as { counting_method: string }[]) ?? [];
  const usedMethods = intervals.map((i) => i.counting_method).filter(Boolean);

  return (
    <div className="space-y-3 rounded-lg border border-slate-400/30 bg-muted/20 p-3 dark:border-slate-600/30">
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_auto_32px]">
        <SelectField
          control={control}
          name={`${namePrefix}.action`}
          label="Tarea"
          options={Object.entries(AVIONICS_ACTION_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <FormField
          control={control}
          name={`${namePrefix}.is_on_condition`}
          render={({ field }) => (
            <FormItem className="flex items-end space-y-0 pb-2">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                Por condición (sin plazo)
              </label>
            </FormItem>
          )}
        />
        {canRemove ? (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label="Quitar tarea" className="h-11 w-8 shrink-0 text-muted-foreground/70 hover:text-destructive">
            <X className="size-3.5" />
          </Button>
        ) : (
          <span />
        )}
      </div>

      {!isOnCondition && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px]">
            <div className="space-y-1">
              <p className={labelClass}>Realizado por</p>
              <ProviderSelect control={control} name={`${namePrefix}.maintenance_provider_id`} />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Último evento</p>
              <CompactDateField control={control} name={`${namePrefix}.first_applied_date`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={labelClass}>
                Límites <span className="text-xs font-normal text-muted-foreground">(varios = lo que ocurra primero)</span>
              </p>
              {fields.length < ALL_COUNTING_METHODS.length && (
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyInterval(usedMethods))} className="gap-1.5 border-dashed text-muted-foreground hover:text-primary">
                  <Plus className="size-3.5" />
                  Agregar límite
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
    </div>
  );
}

function DeviceCard({ control, index, onRemove }: { control: Control<any>; index: number; onRemove: () => void }) {
  const namePrefix = `items.${index}`;
  const { fields, append, remove } = useFieldArray({ control, name: `${namePrefix}.tasks` });
  const description = useWatch({ control, name: `${namePrefix}.description` }) as string;

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          <span className="text-muted-foreground">#{index + 1}</span> {description || "Nuevo equipo"}
        </p>
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="size-8 text-muted-foreground/70 hover:text-destructive">
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quitar equipo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_100px]">
        <TextField control={control} name={`${namePrefix}.description`} label="Descripción" placeholder="EJ: ATC TRANSPONDER" />
        <TextField control={control} name={`${namePrefix}.part_number`} label="N° de Parte" placeholder="P/N" />
        <TextField control={control} name={`${namePrefix}.serial`} label="Serial" placeholder="S/N" />
        <TextField control={control} name={`${namePrefix}.position`} label="Posición" placeholder="# 1" optional />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
        <SelectField
          control={control}
          name={`${namePrefix}.category`}
          label="Sistema"
          options={Object.entries(AVIONICS_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField control={control} name={`${namePrefix}.reference_document`} label="Documento de referencia" placeholder="EJ: AMM 3200/355 / RAV 135" optional />
        <FormField
          control={control}
          name={`${namePrefix}.is_hazardous`}
          render={({ field }) => (
            <FormItem className="flex items-end space-y-0 pb-2">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="size-3.5 text-amber-500" />
                  Mercancía peligrosa
                </span>
              </label>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className={labelClass}>
            Tareas <span className="text-xs font-normal text-muted-foreground">(cada una lleva su propio reloj)</span>
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptyTask())} className="gap-1.5 border-dashed text-muted-foreground hover:text-primary">
            <Plus className="size-3.5" />
            Agregar tarea
          </Button>
        </div>
        {fields.map((field, t) => (
          <TaskCard key={field.id} control={control} namePrefix={`${namePrefix}.tasks.${t}`} onRemove={() => remove(t)} canRemove={fields.length > 1} />
        ))}
        <FormField control={control} name={`${namePrefix}.tasks`} render={() => <FormMessage />} />
      </div>
    </div>
  );
}

function mapToFormItem(item: NonNullable<AvionicsControl["items"]>[number]) {
  return {
    id: item.id,
    category: item.category,
    is_hazardous: item.is_hazardous,
    description: item.description,
    part_number: item.part_number,
    serial: item.serial,
    position: item.position ?? "",
    reference_document: item.reference_document ?? "",
    tasks: item.tasks.map((task) => ({
      id: task.id,
      action: task.action,
      is_on_condition: task.is_on_condition,
      maintenance_provider_id: task.maintenance_provider_id ? String(task.maintenance_provider_id) : "",
      first_applied_date: task.first_applied_date ? parseISO(task.first_applied_date) : undefined,
      intervals: task.intervals.map((interval) => ({
        id: interval.id,
        counting_method: interval.counting_method,
        limit_value: Number(interval.limit_value),
        initial_value: interval.initial_value != null ? Number(interval.initial_value) : undefined,
      })),
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

function buildDefaultValues(initialData?: AvionicsControl): FormValues {
  if (!initialData) return emptyFormValues;

  return {
    aircraft_id: String(initialData.aircraft_id),
    title: initialData.title,
    description: initialData.description ?? "",
    has_reference_manual: initialData.has_reference_manual,
    reference_manual: initialData.reference_manual ?? "",
    maintenance_catalog_manual_id: initialData.maintenance_catalog_manual_id ? Number(initialData.maintenance_catalog_manual_id) : undefined,
    remaining_percentage: Number(initialData.remaining_percentage),
    items: (initialData.items ?? []).filter((i) => i.status === "ACTIVE").map(mapToFormItem),
  };
}

export default function CreateAvionicsControlForm({ initialData }: { initialData?: AvionicsControl }) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const { createAvionicsControl } = useCreateAvionicsControl();
  const { updateAvionicsControl } = useUpdateAvionicsControl();
  const { data: avionicsControls } = useGetAvionicsControls(selectedCompany?.slug);

  const excludeAircraftIds = useMemo(
    () => (avionicsControls ?? []).filter((c) => c.id !== initialData?.id).map((c) => String(c.aircraft_id)),
    [avionicsControls, initialData?.id],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  // Mismo cast que los otros formularios de control (react-hook-form 7.87).
  const control = form.control as unknown as Control<any>;

  const hasReferenceManual = form.watch("has_reference_manual");
  const aircraftId = form.watch("aircraft_id");
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
      items: values.items.map((item) => ({
        id: item.id,
        category: item.category as AvionicsCategory,
        is_hazardous: item.is_hazardous ?? false,
        description: item.description,
        part_number: item.part_number,
        serial: item.serial,
        position: item.position || undefined,
        reference_document: item.reference_document || undefined,
        tasks: item.tasks.map((task) => ({
          id: task.id,
          action: task.action as AvionicsAction,
          is_on_condition: task.is_on_condition ?? false,
          maintenance_provider_id: task.is_on_condition ? undefined : task.maintenance_provider_id || undefined,
          first_applied_date: task.is_on_condition || !task.first_applied_date ? undefined : format(task.first_applied_date, "yyyy-MM-dd"),
          intervals: task.is_on_condition
            ? []
            : task.intervals.map((interval) => ({
                counting_method: interval.counting_method,
                limit_value: interval.limit_value,
                initial_value: interval.initial_value,
              })),
        })),
      })),
    };

    if (isEditing) {
      await updateAvionicsControl.mutateAsync({ id: initialData.id, company: selectedCompany!.slug, data: payload });
    } else {
      await createAvionicsControl.mutateAsync({ company: selectedCompany!.slug, data: payload });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_avionica`);
  };

  const isPending = createAvionicsControl.isPending || updateAvionicsControl.isPending;

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
            <AircraftSelect control={control} name="aircraft_id" excludeIds={excludeAircraftIds} hint="Solo se listan las que aún no tienen un control de aviónica." />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Control de Aviónica YV2272" className={fieldClass} {...field} />
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
                  <FormDescription className={hintClass}>Con cuánto remanente sobre el plazo se avisa que una tarea está próxima a vencer.</FormDescription>
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
                        <Input placeholder="EJ: AMM 3200/355 / RAV 135" className={fieldClass} {...field} />
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
          <FormSection icon={Radio} title="Equipos de Aviónica" hint='La mayoría va "por condición" (solo se lista y verifica); los que tienen plazo llevan sus tareas con fecha e intervalos.'>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <DeviceCard key={field.id} control={control} index={index} onRemove={() => remove(index)} />
              ))}
              {fields.length === 0 && <p className={cn(hintClass, "italic")}>Agregue los equipos de aviónica instalados en esta aeronave.</p>}
              <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem())} className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary">
                <Plus className="size-3.5" />
                Agregar equipo
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
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <p>{isEditing ? "Guardar Cambios" : "Crear Control de Aviónica"}</p>}
        </Button>
      </form>
    </Form>
  );
}
