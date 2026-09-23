"use client";

import { useEffect, useMemo, useRef } from "react";
import { Control, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ClipboardList, Cog, Loader2, Plane, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetComponentControls } from "@/hooks/mantenimiento/planificacion/useGetComponentControls";
import {
  useCreateComponentControl,
  useUpdateComponentControl,
} from "@/actions/mantenimiento/planificacion/control_componentes/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import { ComponentCategory, ComponentControl } from "@/types";
import {
  COMPONENT_ACTION_LABELS,
  COMPONENT_CATEGORY_LABELS,
  COMPONENT_LIMIT_KIND_LABELS,
} from "@/lib/componentControlLabels";
import { FormSection, fieldClass, hintClass, labelClass, selectTriggerClass } from "./_theme";
import { AircraftSelect, CatalogManualField, CompactDateField, FUSELAGE, NumericInput, ProviderSelect, RemainingPercentageField, useParentOptions } from "./_shared";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = { HOURS: "Horas", CYCLES: "Ciclos", DAYS: "Días" };

const countingMethodEnum = z.enum(ALL_COUNTING_METHODS);
const categoryEnum = z.enum(Object.keys(COMPONENT_CATEGORY_LABELS) as [string, ...string[]]);
const actionEnum = z.enum(Object.keys(COMPONENT_ACTION_LABELS) as [string, ...string[]]);
const limitKindEnum = z.enum(Object.keys(COMPONENT_LIMIT_KIND_LABELS) as [string, ...string[]]);

// "" (input vacío) es "no puesto todavía", no 0: si no, el chequeo de
// "obligatorio en horas/ciclos" nunca dispara.
const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

// Vacío = hereda el porcentaje general del control, no 0%.
const optionalPercentage = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0, "Debe ser ≥ 0").max(100, "Debe ser ≤ 100").optional(),
);

const intervalSchema = z.object({
  id: z.number().optional(),
  counting_method: countingMethodEnum,
  limit_kind: limitKindEnum,
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  // Lectura del PADRE al evento; obligatoria salvo en DAYS (ver superRefine).
  initial_value: optionalNumeric,
  // Lo que el componente ya traía gastado al instalarse; 0 si vino nuevo/overhauleado.
  consumed_at_event: optionalNumeric,
});

const itemSchema = z.object({
  id: z.number().optional(),
  category: categoryEnum,
  is_hazardous: z.boolean().default(false),
  description: z.string().min(1, "Requerido"),
  part_number: z.string().min(1, "Requerido"),
  serial: z.string().min(1, "Requerido"),
  position: z.string().optional(),
  action: actionEnum,
  reference_document: z.string().optional(),
  maintenance_provider_id: z.string().min(1, "Seleccione quién lo realizó"),
  first_applied_date: z.date({ error: "Seleccione una fecha" }),
  remaining_percentage: optionalPercentage,
  intervals: z.array(intervalSchema).min(1, "Agregue al menos un intervalo"),
});

const partItemSchema = itemSchema.extend({ aircraft_part_id: z.string() });

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
    selected_part_ids: z.array(z.string()).default([]),
    part_items: z.array(partItemSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.has_reference_manual && !vals.reference_manual?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique el manual de referencia", path: ["reference_manual"] });
    }

    vals.selected_part_ids.forEach((partId) => {
      if (!vals.part_items.some((item) => item.aircraft_part_id === partId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agregue al menos un componente para cada parte seleccionada",
          path: ["part_items"],
        });
      }
    });

    const checkIntervals = (items: z.infer<typeof itemSchema>[], basePath: string) => {
      items.forEach((item, index) => {
        const seen = new Set<string>();
        item.intervals.forEach((interval, i) => {
          if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique la lectura del padre (aeronave o motor/hélice) en ese evento",
              path: [basePath, index, "intervals", i, "initial_value"],
            });
          }
          if ((interval.consumed_at_event ?? 0) >= interval.limit_value) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Lo consumido al instalar no puede alcanzar el límite",
              path: [basePath, index, "intervals", i, "consumed_at_event"],
            });
          }
          if (seen.has(interval.counting_method)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "No puede repetir la misma unidad en dos intervalos",
              path: [basePath, index, "intervals", i, "counting_method"],
            });
          }
          seen.add(interval.counting_method);
        });
      });
    };

    checkIntervals(vals.items, "items");
    checkIntervals(vals.part_items, "part_items");
  });

type FormValues = z.infer<typeof formSchema>;

const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (ALL_COUNTING_METHODS.find((m) => !usedMethods.includes(m)) ?? "HOURS") as "HOURS" | "CYCLES" | "DAYS",
  limit_kind: "HARD_TIME",
  limit_value: undefined as unknown as number,
  consumed_at_event: 0,
});

const emptyItem = () => ({
  category: "OTHER",
  is_hazardous: false,
  description: "",
  part_number: "",
  serial: "",
  position: "",
  action: "OVERHAUL",
  reference_document: "",
  maintenance_provider_id: "",
  first_applied_date: undefined as unknown as Date,
  intervals: [emptyInterval()],
});

function SelectField({
  control,
  name,
  label,
  options,
  placeholder,
}: {
  control: Control<any>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
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
                <SelectValue placeholder={placeholder ?? "Seleccione..."} />
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

function NumericField({
  control,
  name,
  label,
  placeholder = "0",
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <NumericInput
              placeholder={placeholder}
              className={fieldClass}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
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
  canRemove,
}: {
  control: Control<any>;
  namePrefix: string;
  usedMethods: string[];
  onRemove: () => void;
  canRemove: boolean;
}) {
  const countingMethod = useWatch({ control, name: `${namePrefix}.counting_method` });
  const isDays = countingMethod === "DAYS";
  const unitShort = countingMethod === "HOURS" ? "hrs" : countingMethod === "CYCLES" ? "cic" : "días";

  return (
    <div className="grid grid-cols-1 items-end gap-2 rounded-lg border border-slate-400/30 bg-muted/20 p-2 dark:border-slate-600/30 sm:grid-cols-[110px_130px_1fr_1fr_1fr_32px]">
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

      <SelectField
        control={control}
        name={`${namePrefix}.limit_kind`}
        label="Tipo de límite"
        options={Object.entries(COMPONENT_LIMIT_KIND_LABELS).map(([value, label]) => ({ value, label }))}
      />

      <NumericField control={control} name={`${namePrefix}.limit_value`} label={`Límite (${unitShort})`} />

      {isDays ? (
        <div className="space-y-1">
          <p className={labelClass}>Lectura del padre</p>
          <div className={cn(fieldClass, "flex items-center justify-center text-sm text-muted-foreground/40 shadow-none")}>—</div>
        </div>
      ) : (
        <NumericField control={control} name={`${namePrefix}.initial_value`} label={`Padre al evento (${unitShort})`} />
      )}

      <NumericField control={control} name={`${namePrefix}.consumed_at_event`} label={`Consumido al instalar (${unitShort})`} />

      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Quitar intervalo"
          className="h-11 w-8 shrink-0 text-muted-foreground/70 hover:text-destructive"
        >
          <X className="size-3.5" />
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
}

function ComponentCard({
  control,
  arrayName,
  index,
  position,
  onRemove,
}: {
  control: Control<any>;
  arrayName: "items" | "part_items";
  index: number;
  position: number;
  onRemove: () => void;
}) {
  const namePrefix = `${arrayName}.${index}`;
  const { fields, append, remove } = useFieldArray({ control, name: `${namePrefix}.intervals` });
  const intervals = (useWatch({ control, name: `${namePrefix}.intervals` }) as { counting_method: string }[]) ?? [];
  const usedMethods = intervals.map((i) => i.counting_method).filter(Boolean);
  const description = useWatch({ control, name: `${namePrefix}.description` }) as string;

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-linear-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          <span className="text-muted-foreground">#{position + 1}</span> {description || "Nuevo componente"}
        </p>
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="size-8 text-muted-foreground/70 hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quitar componente</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
        <SelectField
          control={control}
          name={`${namePrefix}.category`}
          label="Tipo"
          options={Object.entries(COMPONENT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <SelectField
          control={control}
          name={`${namePrefix}.action`}
          label="Acción al vencer"
          options={Object.entries(COMPONENT_ACTION_LABELS).map(([value, label]) => ({ value, label }))}
        />
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_100px]">
        <TextField control={control} name={`${namePrefix}.description`} label="Descripción" placeholder="EJ: Bomba de combustible" />
        <TextField control={control} name={`${namePrefix}.part_number`} label="N° de Parte" placeholder="P/N" />
        <TextField control={control} name={`${namePrefix}.serial`} label="Serial" placeholder="S/N" />
        <TextField control={control} name={`${namePrefix}.position`} label="Posición" placeholder="LH" optional />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_140px_110px]">
        <TextField
          control={control}
          name={`${namePrefix}.reference_document`}
          label="Documento de referencia"
          placeholder="EJ: SB TPE331-72-0180 R30"
          optional
        />
        <div className="space-y-1">
          <p className={labelClass}>Realizado por</p>
          <ProviderSelect control={control} name={`${namePrefix}.maintenance_provider_id`} />
        </div>
        <div className="space-y-1">
          <p className={labelClass}>Fecha del evento</p>
          <CompactDateField control={control} name={`${namePrefix}.first_applied_date`} />
        </div>
        <div className="space-y-1">
          <p className={labelClass}>
            % Alerta <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
          </p>
          <RemainingPercentageField control={control} name={`${namePrefix}.remaining_percentage`} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className={labelClass}>
            Límites <span className="text-xs font-normal text-muted-foreground">(varios = lo que ocurra primero)</span>
          </p>
          {fields.length < ALL_COUNTING_METHODS.length && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyInterval(usedMethods))}
              className="gap-1.5 border-dashed text-muted-foreground hover:text-primary"
            >
              <Plus className="size-3.5" />
              Agregar límite
            </Button>
          )}
        </div>
        {fields.map((field, i) => (
          <IntervalRow
            key={field.id}
            control={control}
            namePrefix={`${namePrefix}.intervals.${i}`}
            usedMethods={usedMethods}
            onRemove={() => remove(i)}
            canRemove={fields.length > 1}
          />
        ))}
        <FormField control={control} name={`${namePrefix}.intervals`} render={() => <FormMessage />} />
      </div>
    </div>
  );
}

function ComponentPartsSection({ control }: { control: Control<any> }) {
  const { setValue } = useFormContext<FormValues>();
  const { fields, append, remove, replace } = useFieldArray({ control, name: "part_items" });

  const aircraftId = useWatch({ control, name: "aircraft_id" }) as string;
  const selectedPartIds = (useWatch({ control, name: "selected_part_ids" }) as string[]) ?? [];
  const parentOptions = useParentOptions(aircraftId);
  const availableParts = parentOptions.filter((option) => option.id !== FUSELAGE);

  // Al cambiar de aeronave la selección ya no aplica. replace() del propio
  // useFieldArray, no setValue, para no desincronizar su estado interno.
  const previousAircraftId = useRef(aircraftId);
  useEffect(() => {
    if (previousAircraftId.current !== aircraftId) {
      previousAircraftId.current = aircraftId;
      setValue("selected_part_ids", []);
      replace([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aircraftId]);

  // La key sale del id estable de RHF, no del índice: remove() reindexa y una
  // key posicional remonta los Select/Popover de Radix.
  const rowsForPart = (partId: string) =>
    fields
      .map((field: any, index) => ({ id: field.id as string, partId: field.aircraft_part_id, index }))
      .filter((row) => row.partId === partId);

  const togglePart = (partId: string) => {
    if (selectedPartIds.includes(partId)) {
      setValue("selected_part_ids", selectedPartIds.filter((id) => id !== partId));
      const indices = rowsForPart(partId).map((row) => row.index);
      if (indices.length) remove(indices);
    } else {
      setValue("selected_part_ids", [...selectedPartIds, partId]);
    }
  };

  if (!availableParts.length) {
    return <p className={cn(hintClass, "italic")}>Esta aeronave no tiene partes asignadas.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableParts.map((part) => {
          const checked = selectedPartIds.includes(part.id);
          return (
            <div
              key={part.id}
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              onClick={() => togglePart(part.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePart(part.id);
                }
              }}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200",
                checked
                  ? "border-blue-400/40 bg-primary/10 shadow-sm shadow-blue-500/10"
                  : "border-slate-400/50 bg-linear-to-br from-background/70 to-background/40 backdrop-blur-md hover:border-blue-400/30 hover:shadow-sm hover:shadow-blue-500/10 dark:border-slate-600/50",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  checked ? "border-primary bg-primary text-white" : "border-muted-foreground/40",
                )}
              >
                {checked && <Check className="h-3 w-3" />}
              </span>
              <span className="font-medium">{part.label}</span>
            </div>
          );
        })}
      </div>

      {availableParts
        .filter((part) => selectedPartIds.includes(part.id))
        .map((part) => {
          const rows = rowsForPart(part.id);
          return (
            <FormSection key={part.id} icon={Cog} title={part.label}>
              <div className="space-y-4">
                {rows.map((row, position) => (
                  <ComponentCard
                    key={row.id}
                    control={control}
                    arrayName="part_items"
                    index={row.index}
                    position={position}
                    onRemove={() => remove(row.index)}
                  />
                ))}
                {!rows.length && (
                  <p className={cn(hintClass, "italic")}>Agregue al menos un componente para esta parte.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ...emptyItem(), aircraft_part_id: part.id })}
                  className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  Agregar componente
                </Button>
              </div>
            </FormSection>
          );
        })}
    </div>
  );
}

function mapToFormItem(item: NonNullable<ComponentControl["items"]>[number]) {
  return {
    id: item.id,
    category: item.category,
    is_hazardous: item.is_hazardous,
    description: item.description,
    part_number: item.part_number,
    serial: item.serial,
    position: item.position ?? "",
    action: item.action,
    reference_document: item.reference_document ?? "",
    maintenance_provider_id: item.maintenance_provider_id ? String(item.maintenance_provider_id) : "",
    // parseISO, no `new Date`: "yyyy-MM-dd" con new Date cae al día anterior en UTC-4.
    first_applied_date: parseISO(item.first_applied_date),
    remaining_percentage:
      item.remaining_percentage !== null && item.remaining_percentage !== undefined
        ? Number(item.remaining_percentage)
        : undefined,
    intervals: item.intervals.map((interval) => ({
      id: interval.id,
      counting_method: interval.counting_method,
      limit_kind: interval.limit_kind,
      limit_value: Number(interval.limit_value),
      initial_value: interval.initial_value != null ? Number(interval.initial_value) : undefined,
      consumed_at_event: interval.consumed_at_event != null ? Number(interval.consumed_at_event) : 0,
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
  selected_part_ids: [],
  part_items: [],
};

function buildDefaultValues(initialData?: ComponentControl): FormValues {
  if (!initialData) return emptyFormValues;

  // Los removidos se conservan en el backend por historial; el formulario
  // edita solo lo instalado.
  const active = (initialData.items ?? []).filter((i) => i.status === "ACTIVE");
  const partItems = active.filter((i) => i.parent_aircraft_part_id);

  return {
    aircraft_id: String(initialData.aircraft_id),
    title: initialData.title,
    description: initialData.description ?? "",
    has_reference_manual: initialData.has_reference_manual,
    reference_manual: initialData.reference_manual ?? "",
    maintenance_catalog_manual_id: initialData.maintenance_catalog_manual_id
      ? Number(initialData.maintenance_catalog_manual_id)
      : undefined,
    remaining_percentage: Number(initialData.remaining_percentage),
    items: active.filter((i) => !i.parent_aircraft_part_id).map(mapToFormItem),
    selected_part_ids: Array.from(new Set(partItems.map((i) => String(i.parent_aircraft_part_id)))),
    part_items: partItems.map((item) => ({
      ...mapToFormItem(item),
      aircraft_part_id: String(item.parent_aircraft_part_id),
    })),
  };
}

export default function CreateComponentControlForm({ initialData }: { initialData?: ComponentControl }) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const { createComponentControl } = useCreateComponentControl();
  const { updateComponentControl } = useUpdateComponentControl();
  const { data: componentControls } = useGetComponentControls(selectedCompany?.slug);

  const excludeAircraftIds = useMemo(
    () =>
      (componentControls ?? [])
        .filter((c) => c.id !== initialData?.id)
        .map((c) => String(c.aircraft_id)),
    [componentControls, initialData?.id],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  // Mismo cast que CreateMaintenanceControlForm: desde react-hook-form 7.87
  // el genérico no es asignable a Control<any> con arrays anidados.
  const control = form.control as unknown as Control<any>;

  const hasReferenceManual = useWatch({ control, name: "has_reference_manual" });
  const aircraftId = useWatch({ control, name: "aircraft_id" });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (values: FormValues) => {
    // El backend recibe una sola lista; el conjunto al que pertenece cada
    // componente sale de en qué sección se cargó.
    const allItems = [
      ...values.items.map((item) => ({ ...item, aircraft_part_id: null as string | null })),
      ...values.part_items,
    ];

    const payload = {
      aircraft_id: values.aircraft_id,
      title: values.title,
      description: values.description,
      has_reference_manual: values.has_reference_manual ?? false,
      reference_manual: values.reference_manual,
      maintenance_catalog_manual_id: values.maintenance_catalog_manual_id,
      remaining_percentage: values.remaining_percentage,
      items: allItems.map((item) => ({
        id: item.id,
        parent_aircraft_part_id: item.aircraft_part_id ? Number(item.aircraft_part_id) : null,
        maintenance_provider_id: item.maintenance_provider_id,
        category: item.category as ComponentCategory,
        is_hazardous: item.is_hazardous ?? false,
        description: item.description,
        part_number: item.part_number,
        serial: item.serial,
        position: item.position || undefined,
        action: item.action as "OVERHAUL" | "REPLACE" | "REPAIR" | "INSPECTION",
        reference_document: item.reference_document || undefined,
        first_applied_date: format(item.first_applied_date, "yyyy-MM-dd"),
        remaining_percentage: item.remaining_percentage ?? null,
        intervals: item.intervals.map((interval) => ({
          counting_method: interval.counting_method,
          limit_kind: interval.limit_kind as "HARD_TIME" | "LIFE_LIMIT",
          limit_value: interval.limit_value,
          initial_value: interval.initial_value,
          consumed_at_event: interval.consumed_at_event ?? 0,
        })),
      })),
    };

    if (isEditing) {
      await updateComponentControl.mutateAsync({ id: initialData.id, company: selectedCompany!.slug, data: payload });
    } else {
      await createComponentControl.mutateAsync({ company: selectedCompany!.slug, data: payload });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_componentes`);
  };

  const isPending = createComponentControl.isPending || updateComponentControl.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          // Enter en un <input> enviaría el formulario entero.
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="flex flex-col gap-6"
      >
        <FormSection
          icon={ClipboardList}
          title="Datos Básicos"
          hint="Aeronave, título y a partir de qué remanente se avisa."
          action={<CreateMaintenanceProviderDialog />}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AircraftSelect
              control={control}
              name="aircraft_id"
              excludeIds={excludeAircraftIds}
              hint="Solo se listan las que aún no tienen un control de componentes."
            />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Control de Componentes YV2272" className={fieldClass} {...field} />
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
                      <NumericInput
                        className={cn(fieldClass, "pr-8")}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription className={hintClass}>
                    Con cuánto remanente sobre el límite se avisa que un componente está próximo a vencer (15% es lo habitual en el 43-004).
                  </FormDescription>
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
                    Descripción <span className="text-muted-foreground text-xs">(Opcional)</span>
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
                <FormItem
                  className={cn(
                    fieldClass,
                    "h-auto shadow-none md:col-span-2 flex flex-row items-start space-x-3 space-y-0 p-4 hover:shadow-none",
                  )}
                >
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
                        <Input placeholder="EJ: MPM JS32 REV.01 06/04/2024" className={fieldClass} {...field} />
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
          <>
          <FormSection
            icon={Plane}
            title="Aeronave"
            hint="Componentes medidos contra las horas/ciclos de la aeronave."
          >
            <div className="space-y-4">
              {fields.map((field, index) => (
                <ComponentCard
                  key={field.id}
                  control={control}
                  arrayName="items"
                  index={index}
                  position={index}
                  onRemove={() => remove(index)}
                />
              ))}
              {fields.length === 0 && <p className={cn(hintClass, "italic")}>Agregue los componentes de la aeronave.</p>}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyItem())}
                className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
              >
                <Plus className="size-3.5" />
                Agregar componente
              </Button>
            </div>
          </FormSection>

          <FormSection
            icon={Cog}
            title="Partes de la Aeronave"
            hint="Motores, turbinas y hélices con componentes propios; se miden contra el contador de esa parte."
          >
            <ComponentPartsSection control={control} />
          </FormSection>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/50 bg-muted/20 p-8 text-center dark:border-slate-600/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">Seleccione una aeronave para continuar</p>
            <p className={hintClass}>Ahí se cargan sus motores y hélices para colgar los componentes.</p>
          </div>
        )}

        <Button
          className="h-11 gap-2 self-end rounded-lg bg-linear-to-br from-primary to-primary/85 px-6 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <p>{isEditing ? "Guardar Cambios" : "Crear Control de Componentes"}</p>}
        </Button>
      </form>
    </Form>
  );
}
