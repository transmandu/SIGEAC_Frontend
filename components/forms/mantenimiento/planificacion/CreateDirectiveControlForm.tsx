"use client";

import {
  EditReasonFields,
  EditReasonValue,
  editReasonErrorFrom,
} from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Check,
  ClipboardList,
  Cog,
  HelpCircle,
  Loader2,
  Plane,
  Plus,
  X,
} from "lucide-react";

import { CatalogServicePicker } from "@/components/misc/CatalogServicePicker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetDirectiveControls } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControls";
import {
  useCreateDirectiveControl,
  useUpdateDirectiveControl,
} from "@/actions/mantenimiento/planificacion/control_directivas/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import {
  DirectiveAuthority,
  DirectiveComplianceType,
  DirectiveControl,
} from "@/types";
import {
  DIRECTIVE_AUTHORITY_LABELS,
  DIRECTIVE_COMPLIANCE_TYPE_LABELS,
} from "@/lib/directiveControlLabels";
import {
  FormSection,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "./_theme";
import {
  AircraftSelect,
  CatalogManualField,
  CompactDateField,
  FUSELAGE,
  NumericInput,
  ProviderSelect,
  RemainingPercentageField,
  useParentOptions,
  useSuggestedControlTitle,
} from "./_shared";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = {
  HOURS: "Horas",
  CYCLES: "Ciclos",
  DAYS: "Días",
};

const countingMethodEnum = z.enum(ALL_COUNTING_METHODS);
const authorityEnum = z.enum(
  Object.keys(DIRECTIVE_AUTHORITY_LABELS) as [string, ...string[]],
);
const complianceTypeEnum = z.enum(
  Object.keys(DIRECTIVE_COMPLIANCE_TYPE_LABELS) as [string, ...string[]],
);

const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

// Vacío = hereda el porcentaje general del control, no 0%.
const optionalPercentage = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce
    .number()
    .min(0, "Debe ser ≥ 0")
    .max(100, "Debe ser ≤ 100")
    .optional(),
);

const intervalSchema = z.object({
  id: z.number().optional(),
  counting_method: countingMethodEnum,
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  initial_value: optionalNumeric,
});

const itemSchema = z.object({
  id: z.number().optional(),
  // Entrada del catálogo de la que salió la AD, si se eligió con el selector
  // en vez de tipearla; el catálogo ayuda a llenar, nunca obliga.
  maintenance_catalog_service_id: z.number().optional(),
  ad_number: z.string().min(1, "Requerido"),
  authority: authorityEnum,
  revision: z.string().optional(),
  description: z.string().min(1, "Requerido"),
  reference_document: z.string().optional(),
  compliance_method: z.string().optional(),
  compliance_type: complianceTypeEnum,
  maintenance_provider_id: z.string().optional(),
  first_applied_date: z.date().optional(),
  remaining_percentage: optionalPercentage,
  intervals: z.array(intervalSchema).default([]),
});

const partItemSchema = itemSchema.extend({ aircraft_part_id: z.string() });

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
    remaining_percentage: z.coerce
      .number()
      .min(0, "Debe ser ≥ 0")
      .max(100, "Debe ser ≤ 100"),
    items: z.array(itemSchema).default([]),
    selected_part_ids: z.array(z.string()).default([]),
    part_items: z.array(partItemSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.has_reference_manual && !vals.reference_manual?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique el manual de referencia",
        path: ["reference_manual"],
      });
    }

    vals.selected_part_ids.forEach((partId) => {
      if (!vals.part_items.some((item) => item.aircraft_part_id === partId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Agregue al menos una directiva para cada conjunto seleccionado",
          path: ["part_items"],
        });
      }
    });

    const checkItems = (
      items: z.infer<typeof itemSchema>[],
      basePath: string,
    ) => {
      items.forEach((item, index) => {
        const path = [basePath, index];

        const isRecurrent = item.compliance_type === "RECURRENT";
        if (isRecurrent && !item.first_applied_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique la fecha del último cumplimiento",
            path: [...path, "first_applied_date"],
          });
        }
        if (isRecurrent && item.intervals.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Una AD recurrente necesita al menos un límite",
            path: [...path, "intervals"],
          });
        }
        if (
          !isRecurrent &&
          item.intervals.length > 0 &&
          !item.first_applied_date
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Indique la fecha del último cumplimiento desde la que corre el límite",
            path: [...path, "first_applied_date"],
          });
        }

        const seen = new Set<string>();
        item.intervals.forEach((interval, i) => {
          if (
            interval.counting_method !== "DAYS" &&
            interval.initial_value === undefined
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Indique las horas/ciclos del conjunto en la fecha de referencia",
              path: [...path, "intervals", i, "initial_value"],
            });
          }
          if (seen.has(interval.counting_method)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "No puede repetir la misma unidad",
              path: [...path, "intervals", i, "counting_method"],
            });
          }
          seen.add(interval.counting_method);
        });
      });
    };

    checkItems(vals.items, "items");
    checkItems(vals.part_items, "part_items");
  });

type FormValues = z.infer<typeof formSchema>;

const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (["HOURS", "CYCLES", "DAYS"].find(
    (m) => !usedMethods.includes(m),
  ) ?? "HOURS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

const emptyItem = () => ({
  maintenance_catalog_service_id: undefined as number | undefined,
  ad_number: "",
  authority: "FAA",
  revision: "",
  description: "",
  reference_document: "",
  compliance_method: "",
  compliance_type: "ONE_TIME",
  maintenance_provider_id: "",
  first_applied_date: undefined as unknown as Date,
  remaining_percentage: undefined as number | undefined,
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
        <FormItem className="min-w-0 space-y-1">
          <FormLabel className={cn(labelClass, "block truncate")}>
            {label}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
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

/**
 * `optional` va como ícono con tooltip, no como "(Opcional)" escrito: en las
 * columnas angostas ese sufijo obligaba a truncar el nombre del campo.
 */
function TextField({
  control,
  name,
  label,
  placeholder,
  optional,
  hint,
  className,
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
}) {
  const tooltip = [optional && "Opcional.", hint].filter(Boolean).join(" ");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("min-w-0 space-y-1", className)}>
          <FormLabel className={cn(labelClass, "flex items-center gap-1")}>
            <span className="truncate">{label}</span>
            {tooltip && (
              <TooltipProvider disableHoverableContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3 shrink-0 text-muted-foreground/60" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              className={cn(fieldClass, "w-full")}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Los límites se leen como una tabla: los rótulos los pone el encabezado una
 * sola vez y las filas solo llevan campos. Repetirlos en cada fila hacía que
 * dos o tres se vieran como un amontonamiento.
 */
const INTERVAL_GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_32px]";

const INTERVAL_COLUMNS: { label: string; hint?: string }[] = [
  { label: "Unidad" },
  { label: "Límite" },
  {
    label: "Hrs/clc al cumplir",
    hint: "Horas o ciclos que marca la aeronave (o el conjunto) al cumplir esta AD ahora. Es el punto de partida: el límite se cuenta desde ese número. Use 0 si el límite corre sobre el total acumulado.",
  },
];

function IntervalHeader() {
  return (
    <div className={cn(INTERVAL_GRID, "gap-2 px-1")}>
      {INTERVAL_COLUMNS.map(({ label, hint }) => (
        <span
          key={label}
          className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70"
        >
          <span className="truncate">{label}</span>
          {hint && (
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-3 shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-56 normal-case">
                  {hint}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </span>
      ))}
      <span />
    </div>
  );
}

/** Campo numérico sin rótulo propio: el suyo lo pone `IntervalHeader`. */
function CompactNumericField({
  control,
  name,
  suffix,
}: {
  control: Control<any>;
  name: string;
  suffix?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 space-y-0">
          <FormControl>
            <div className="relative">
              <NumericInput
                placeholder="0"
                className={cn(fieldClass, "w-full", suffix && "pr-11")}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
              />
              {suffix && (
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
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
  const countingMethod = useWatch({
    control,
    name: `${namePrefix}.counting_method`,
  });
  const isDays = countingMethod === "DAYS";
  const unitShort =
    countingMethod === "HOURS"
      ? "hrs"
      : countingMethod === "CYCLES"
        ? "cic"
        : "días";

  return (
    <div className={cn(INTERVAL_GRID, "items-start gap-2")}>
      <FormField
        control={control}
        name={`${namePrefix}.counting_method`}
        render={({ field }) => (
          <FormItem className="min-w-0 space-y-0">
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger className={cn(selectTriggerClass, "w-full")}>
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ALL_COUNTING_METHODS.filter(
                  (unit) => unit === field.value || !usedMethods.includes(unit),
                ).map((unit) => (
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

      <CompactNumericField
        control={control}
        name={`${namePrefix}.limit_value`}
        suffix={unitShort}
      />

      {/* Un límite en días corre por calendario: la lectura del conjunto no
          entra en ese cálculo, así que la celda queda neutralizada. */}
      {isDays ? (
        <div
          className={cn(
            fieldClass,
            "flex items-center justify-center text-sm text-muted-foreground/40 shadow-none",
          )}
        >
          —
        </div>
      ) : (
        <CompactNumericField
          control={control}
          name={`${namePrefix}.initial_value`}
          suffix={unitShort}
        />
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Quitar intervalo"
        className="h-11 w-8 shrink-0 justify-self-end text-muted-foreground/70 hover:text-destructive"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

function DirectiveCard({
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
  const { setValue } = useFormContext<FormValues>();
  const adNumber = useWatch({
    control,
    name: `${namePrefix}.ad_number`,
  }) as string;
  // Acotan el catálogo a la aeronave del control y, si hay uno elegido en la
  // cabecera, a su manual.
  const aircraftId = useWatch({ control, name: "aircraft_id" }) as string;
  const manualId = useWatch({
    control,
    name: "maintenance_catalog_manual_id",
  }) as number | undefined;
  const manualName = useWatch({
    control,
    name: "reference_manual",
  }) as string;
  const complianceType = useWatch({
    control,
    name: `${namePrefix}.compliance_type`,
  }) as DirectiveComplianceType;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}.intervals`,
  });
  const intervals =
    (useWatch({ control, name: `${namePrefix}.intervals` }) as {
      counting_method: string;
    }[]) ?? [];
  const usedMethods = intervals.map((i) => i.counting_method).filter(Boolean);

  const isRecurrent = complianceType === "RECURRENT";

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-linear-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">
          <span className="text-muted-foreground">#{position + 1}</span>{" "}
          {adNumber || "Nueva directiva"}
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
            <TooltipContent>Quitar directiva</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* El catálogo llena de una vez N° de AD, documento y revisión; los tres
          siguen editables porque no toda AD está cargada ahí todavía. La
          autoridad la pone el usuario: el catálogo no la registra. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,120px)_minmax(0,90px)]">
        {/* El picker va pegado al documento (no en su propia columna), igual
            que en el Control de Mantenimiento: el ícono es del campo. */}
        <div className="flex items-start gap-1">
          <TextField
            control={control}
            name={`${namePrefix}.reference_document`}
            label="Documento de referencia"
            placeholder="EJ: SB 407-32-101"
            className="flex-1"
            optional
          />
          {/* Rótulo fantasma: baja el botón a la altura del input sin
              desalinear el campo respecto de los de al lado. Copia el `flex`
              del rótulo real para que ambos midan exactamente lo mismo. */}
          <div className="space-y-1">
            <span
              className={cn(labelClass, "flex items-center gap-1")}
              aria-hidden
            >
              &nbsp;
            </span>
            <CatalogServicePicker
              aircraftId={aircraftId}
              manualId={manualId}
              manualName={manualName}
              onSelectService={(service) => {
                // El nombre del servicio ES la AD; el documento sale del
                // manual al que está ligada, y la revisión de ese manual.
                setValue(`${namePrefix}.ad_number` as any, service.name, {
                  shouldValidate: true,
                });
                setValue(
                  `${namePrefix}.maintenance_catalog_service_id` as any,
                  service.id,
                );
                if (service.manual) {
                  setValue(
                    `${namePrefix}.reference_document` as any,
                    service.manual.name,
                    { shouldValidate: true },
                  );
                  if (service.manual.revision) {
                    setValue(
                      `${namePrefix}.revision` as any,
                      service.manual.revision,
                      { shouldValidate: true },
                    );
                  }
                }
                if (service.description) {
                  setValue(
                    `${namePrefix}.description` as any,
                    service.description,
                    { shouldValidate: true },
                  );
                }
              }}
            />
          </div>
        </div>
        <TextField
          control={control}
          name={`${namePrefix}.ad_number`}
          label="N° de AD"
          placeholder="EJ: 2019-05-04"
        />
        <SelectField
          control={control}
          name={`${namePrefix}.authority`}
          label="Autoridad"
          options={Object.entries(DIRECTIVE_AUTHORITY_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <TextField
          control={control}
          name={`${namePrefix}.revision`}
          label="Revisión"
          placeholder="R1"
          optional
        />
      </div>

      {/* Qué exige la AD y cómo se cumple, con quién la hizo y cuándo. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,150px)]">
        <TextField
          control={control}
          name={`${namePrefix}.description`}
          label="Descripción"
          placeholder="EJ: Inspección de tren de aterrizaje principal"
        />
        <TextField
          control={control}
          name={`${namePrefix}.compliance_method`}
          label="Método de cumplimiento"
          placeholder="EJ: Inspección visual párrafo (e)"
          optional
        />
        <SelectField
          control={control}
          name={`${namePrefix}.compliance_type`}
          label="Tipo de cumplimiento"
          options={Object.entries(DIRECTIVE_COMPLIANCE_TYPE_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <FormItem className="min-w-0 space-y-1">
          <FormLabel className={cn(labelClass, "block truncate")}>
            Realizado por
          </FormLabel>
          <ProviderSelect
            control={control}
            name={`${namePrefix}.maintenance_provider_id`}
          />
        </FormItem>
        <FormItem className="min-w-0 space-y-1">
          <FormLabel className={cn(labelClass, "flex items-center gap-1")}>
            <span className="truncate">Último cump.</span>
            <TooltipProvider disableHoverableContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="size-3 shrink-0 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent className="max-w-56">
                  {isRecurrent
                    ? "Fecha en que se cumplió esta AD por última vez (el cumplimiento que está cargando, si es nuevo). Desde ahí se cuenta el próximo vencimiento."
                    : "Fecha en que se cumplió esta AD. Si todavía no se cumplió, use la de efectividad: desde ahí corre su límite."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <CompactDateField
            control={control}
            name={`${namePrefix}.first_applied_date`}
          />
        </FormItem>
      </div>

      <div className="space-y-2 border-t border-slate-400/25 pt-3 dark:border-slate-600/25">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={labelClass}>
            Límites{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {isRecurrent
                ? "(varios = lo que ocurra primero)"
                : "(vacío si ya se cumplió o no tiene límite)"}
            </span>
          </p>
          <div className="flex items-center gap-2">
            {/* El % vive con los límites: solo tiene sentido cuando hay uno
                del que avisar. */}
            <FormLabel
              className={cn(labelClass, "whitespace-nowrap")}
              title="Con cuánto remanente avisar que esta AD está por vencer. Viene del % de Datos Básicos y se puede cambiar."
            >
              Avisar al
            </FormLabel>
            <div className="w-20">
              <RemainingPercentageField
                control={control}
                name={`${namePrefix}.remaining_percentage`}
                follows
              />
            </div>
          </div>
        </div>

        {/* La tabla no colapsa a una columna: sus cuatro celdas se leen en
            relación (unidad, límite, lectura). En pantallas angostas se
            desplaza en lugar de comprimir los campos hasta romperlos. */}
        <div className="overflow-x-auto">
          <div className="min-w-100 space-y-2">
            {fields.length > 0 && <IntervalHeader />}
            {fields.map((field, i) => (
              <IntervalRow
                key={field.id}
                control={control}
                namePrefix={`${namePrefix}.intervals.${i}`}
                usedMethods={usedMethods}
                onRemove={() => remove(i)}
              />
            ))}
          </div>
        </div>
        <FormField
          control={control}
          name={`${namePrefix}.intervals`}
          render={() => <FormMessage />}
        />

        {fields.length < ALL_COUNTING_METHODS.length && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(emptyInterval(usedMethods))}
            className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
          >
            <Plus className="size-3.5" />
            Agregar límite
          </Button>
        )}
      </div>

    </div>
  );
}

function DirectivePartsSection({ control }: { control: Control<any> }) {
  const { setValue } = useFormContext<FormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "part_items",
  });

  const aircraftId = useWatch({ control, name: "aircraft_id" }) as string;
  const selectedPartIds =
    (useWatch({ control, name: "selected_part_ids" }) as string[]) ?? [];
  const parentOptions = useParentOptions(aircraftId);
  const availableParts = parentOptions.filter(
    (option) => option.id !== FUSELAGE,
  );

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
      .map((field: any, index) => ({
        id: field.id as string,
        partId: field.aircraft_part_id,
        index,
      }))
      .filter((row) => row.partId === partId);

  const togglePart = (partId: string) => {
    if (selectedPartIds.includes(partId)) {
      setValue(
        "selected_part_ids",
        selectedPartIds.filter((id) => id !== partId),
      );
      const indices = rowsForPart(partId).map((row) => row.index);
      if (indices.length) remove(indices);
    } else {
      setValue("selected_part_ids", [...selectedPartIds, partId]);
    }
  };

  if (!availableParts.length) {
    return (
      <p className={cn(hintClass, "italic")}>
        Esta aeronave no tiene partes asignadas.
      </p>
    );
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
                  checked
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/40",
                )}
              >
                {checked && <Check className="h-3 w-3" />}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {part.typeLabel}
                </span>
                <span className="font-medium">{part.name}</span>
              </span>
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
                  <DirectiveCard
                    key={row.id}
                    control={control}
                    arrayName="part_items"
                    index={row.index}
                    position={position}
                    onRemove={() => remove(row.index)}
                  />
                ))}
                {!rows.length && (
                  <p className={cn(hintClass, "italic")}>
                    Agregue al menos una AD para este conjunto.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ ...emptyItem(), aircraft_part_id: part.id })
                  }
                  className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  Agregar directiva
                </Button>
              </div>
            </FormSection>
          );
        })}
    </div>
  );
}

function mapToFormItem(item: NonNullable<DirectiveControl["items"]>[number]) {
  return {
    id: item.id,
    maintenance_catalog_service_id:
      item.maintenance_catalog_service_id ?? undefined,
    ad_number: item.ad_number,
    authority: item.authority,
    revision: item.revision ?? "",
    description: item.description,
    reference_document: item.reference_document ?? "",
    compliance_method: item.compliance_method ?? "",
    compliance_type: item.compliance_type,
    maintenance_provider_id: item.maintenance_provider_id
      ? String(item.maintenance_provider_id)
      : "",
    first_applied_date: item.first_applied_date
      ? parseISO(item.first_applied_date)
      : undefined,
    remaining_percentage:
      item.remaining_percentage !== null &&
      item.remaining_percentage !== undefined
        ? Number(item.remaining_percentage)
        : undefined,
    intervals: item.intervals.map((interval) => ({
      id: interval.id,
      counting_method: interval.counting_method,
      limit_value: Number(interval.limit_value),
      initial_value:
        interval.initial_value != null
          ? Number(interval.initial_value)
          : undefined,
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

function buildDefaultValues(initialData?: DirectiveControl): FormValues {
  if (!initialData) return emptyFormValues;

  const all = (initialData.items ?? []).filter((i) => !i.retired_at);
  const partItems = all.filter((i) => i.parent_aircraft_part_id);

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
    items: all.filter((i) => !i.parent_aircraft_part_id).map(mapToFormItem),
    selected_part_ids: Array.from(
      new Set(partItems.map((i) => String(i.parent_aircraft_part_id))),
    ),
    part_items: partItems.map((item) => ({
      ...mapToFormItem(item),
      aircraft_part_id: String(item.parent_aircraft_part_id),
    })),
  };
}

export default function CreateDirectiveControlForm({
  initialData,
}: {
  initialData?: DirectiveControl;
}) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const [reason, setReason] = useState<EditReasonValue>({});
  const [reasonError, setReasonError] = useState<string>();
  const { createDirectiveControl } = useCreateDirectiveControl();
  const { updateDirectiveControl } = useUpdateDirectiveControl();
  const { data: directiveControls } = useGetDirectiveControls(
    selectedCompany?.slug,
    true,
  );

  const excludeAircraftIds = useMemo(
    () =>
      (directiveControls ?? [])
        .filter((c) => c.id !== initialData?.id)
        .map((c) => String(c.aircraft_id)),
    [directiveControls, initialData?.id],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });
  // Leído en render: react-hook-form solo rastrea lo que se suscribe aquí.
  const { isDirty } = form.formState;

  // Mismo cast que los otros formularios de control (react-hook-form 7.87).
  const control = form.control as unknown as Control<any>;

  const hasReferenceManual = useWatch({
    control,
    name: "has_reference_manual",
  });
  const aircraftId = useWatch({ control, name: "aircraft_id" });

  useSuggestedControlTitle(form, "Directivas");
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (values: FormValues) => {
    // El backend recibe una sola lista; el conjunto afectado sale de en qué
    // sección se cargó la AD.
    const allItems = [
      ...values.items.map((item) => ({
        ...item,
        aircraft_part_id: null as string | null,
      })),
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
        maintenance_catalog_service_id: item.maintenance_catalog_service_id,
        parent_aircraft_part_id: item.aircraft_part_id
          ? Number(item.aircraft_part_id)
          : null,
        ad_number: item.ad_number,
        authority: item.authority as DirectiveAuthority,
        revision: item.revision || undefined,
        description: item.description,
        reference_document: item.reference_document || undefined,
        compliance_method: item.compliance_method || undefined,
        compliance_type: item.compliance_type as DirectiveComplianceType,
        maintenance_provider_id: item.maintenance_provider_id || undefined,
        first_applied_date: item.first_applied_date
          ? format(item.first_applied_date, "yyyy-MM-dd")
          : undefined,
        remaining_percentage: item.remaining_percentage ?? null,
        intervals: item.intervals.map((interval) => ({
          counting_method: interval.counting_method,
          limit_value: interval.limit_value,
          initial_value: interval.initial_value,
        })),
      })),
    };

    if (isEditing) {
      if (isDirty && !reason.edit_reason) {
        setReasonError("Indique el motivo de la corrección.");
        return;
      }

      try {
        await updateDirectiveControl.mutateAsync({
          id: initialData.id,
          company: selectedCompany!.slug,
          data: { ...payload, ...reason },
        });
      } catch (error) {
        setReasonError(editReasonErrorFrom(error));
        return;
      }
    } else {
      await createDirectiveControl.mutateAsync({
        company: selectedCompany!.slug,
        data: payload,
      });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_directivas`);
  };

  const isPending =
    createDirectiveControl.isPending || updateDirectiveControl.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLElement).tagName !== "TEXTAREA"
          )
            e.preventDefault();
        }}
        className="flex flex-col gap-6"
      >
        <FormSection
          icon={ClipboardList}
          title="Datos Básicos"
          hint="Aeronave, título y a partir de qué remanente se avisa."
          action={<CreateMaintenanceProviderDialog />}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(150px,190px)_2fr_minmax(96px,140px)]">
            <AircraftSelect
              control={control}
              name="aircraft_id"
              excludeIds={excludeAircraftIds}
              hint="Solo se listan las que aún no tienen un control de directivas."
            />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="EJ: Control de Directivas YV2272"
                      className={fieldClass}
                      {...field}
                    />
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
                  <FormLabel className={labelClass}>% Remanente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumericInput
                        className={cn(fieldClass, "pr-7")}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className={hintClass}>
                    Remanente para alertar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full md:col-span-3">
                  <FormLabel className={labelClass}>
                    Descripción{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="..."
                      className={cn(fieldClass, "h-auto resize-none py-2")}
                      {...field}
                    />
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
                    "h-auto shadow-none md:col-span-3 flex flex-row items-start space-x-3 space-y-0 p-4 hover:shadow-none",
                  )}
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={labelClass}>
                      ¿Tiene manual de referencia?
                    </FormLabel>
                    <FormDescription className={hintClass}>
                      Indique si este control se basa en un manual específico.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {hasReferenceManual && (
              <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
                <CatalogManualField control={control} aircraftId={aircraftId} />
                <FormField
                  control={control}
                  name="reference_manual"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>
                        Manual de Referencia
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="EJ: Listado AD FAA / RAV 39"
                          className={fieldClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </FormSection>

        {aircraftId ? (
          <>
            <FormSection
              icon={Plane}
              title="Aeronave"
              hint="AD que afectan a la aeronave en su conjunto; las descartadas quedan con su motivo."
            >
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <DirectiveCard
                    key={field.id}
                    control={control}
                    arrayName="items"
                    index={index}
                    position={index}
                    onRemove={() => remove(index)}
                  />
                ))}
                {fields.length === 0 && (
                  <p className={cn(hintClass, "italic")}>
                    Agregue las AD evaluadas para esta aeronave.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptyItem())}
                  className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
                >
                  <Plus className="size-3.5" />
                  Agregar directiva
                </Button>
              </div>
            </FormSection>

            <FormSection
              icon={Cog}
              title="Partes de la Aeronave"
              hint="Motores, turbinas y hélices con AD propias; se miden contra el contador de esa parte."
            >
              <DirectivePartsSection control={control} />
            </FormSection>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-400/50 bg-muted/20 p-8 text-center dark:border-slate-600/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Seleccione una aeronave para continuar
            </p>
          </div>
        )}

        {isEditing && (
          <EditReasonFields
            value={reason}
            onChange={(value) => {
              setReason(value);
              setReasonError(undefined);
            }}
            error={reasonError}
          />
        )}

        <Button
          className="h-11 gap-2 self-end rounded-lg bg-linear-to-br from-primary to-primary/85 px-6 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>
              {isEditing ? "Guardar Cambios" : "Crear Control de Directivas"}
            </p>
          )}
        </Button>
      </form>
    </Form>
  );
}
