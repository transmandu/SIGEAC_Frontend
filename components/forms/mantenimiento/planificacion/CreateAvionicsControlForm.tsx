"use client";

import {
  EditReasonFields,
  EditReasonValue,
  editReasonErrorFrom,
} from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { useEffect, useMemo, useState } from "react";
import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  HelpCircle,
  Loader2,
  Plane,
  Plus,
  Radio,
  X,
} from "lucide-react";

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
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import {
  useCreateAvionicsControl,
  useUpdateAvionicsControl,
} from "@/actions/mantenimiento/planificacion/control_avionica/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import { AvionicsAction, AvionicsControl, ControlItemFlag } from "@/types";
import { CONTROL_ITEM_FLAGS } from "@/lib/controlItemFlags";
import {
  appliedDateOf,
  appliedReadingOf,
  consumedAtStartOf,
} from "@/lib/complianceFormMapping";
import { ControlItemFlagsField } from "./ControlItemFlagsField";
import { AVIONICS_ACTION_LABELS } from "@/lib/avionicsControlLabels";
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
  NumericInput,
  ProviderSelect,
  RemainingPercentageField,
  useSuggestedControlTitle,
  notifyInvalidForm,
} from "./_shared";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = {
  HOURS: "Horas",
  CYCLES: "Ciclos",
  DAYS: "Días",
};

const countingMethodEnum = z.enum(ALL_COUNTING_METHODS);
const actionEnum = z.enum(
  Object.keys(AVIONICS_ACTION_LABELS) as [string, ...string[]],
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

// Una tarea por condición no lleva fecha, proveedor ni intervalos; una
// programada exige los tres (ver superRefine).
const taskSchema = z.object({
  id: z.number().optional(),
  action: actionEnum,
  is_on_condition: z.boolean().default(false),
  maintenance_provider_id: z.string().optional(),
  applied_date: z.date().optional(),
  remaining_percentage: optionalPercentage,
  intervals: z.array(intervalSchema).default([]),
});

const itemSchema = z.object({
  id: z.number().optional(),
  flags: z.array(z.enum(CONTROL_ITEM_FLAGS)).default([]),
  description: z.string().min(1, "Requerido"),
  // Redacción para la OT y los formatos INAC; vacía = se usa `description`.
  declared_description: z.string().optional(),
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
    remaining_percentage: z.coerce
      .number()
      .min(0, "Debe ser ≥ 0")
      .max(100, "Debe ser ≤ 100"),
    items: z.array(itemSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.has_reference_manual && !vals.reference_manual?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique el manual de referencia",
        path: ["reference_manual"],
      });
    }

    vals.items.forEach((item, index) => {
      item.tasks.forEach((task, t) => {
        if (task.is_on_condition) return;
        const path = ["items", index, "tasks", t];
        // Una tarea existente sin cumplimiento vigente no trae aplicación: se
        // deja como está y no se le exige lo que solo pide iniciar uno.
        const unchanged = task.id !== undefined && !task.applied_date;

        if (!unchanged && !task.applied_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique la fecha del último evento",
            path: [...path, "applied_date"],
          });
        }
        if (!unchanged && !task.maintenance_provider_id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique quién la realizó",
            path: [...path, "maintenance_provider_id"],
          });
        }
        if (task.intervals.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Agregue al menos un intervalo o marque la tarea por condición",
            path: [...path, "intervals"],
          });
        }

        const seen = new Set<string>();
        task.intervals.forEach((interval, i) => {
          if (
            !unchanged &&
            interval.counting_method !== "DAYS" &&
            interval.initial_value === undefined
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique las horas/ciclos de la aeronave en ese evento",
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
    });
  });

type FormValues = z.infer<typeof formSchema>;

// Casi todo plazo de aviónica es calendario: la unidad nace en DAYS.
const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (["DAYS", "HOURS", "CYCLES"].find(
    (m) => !usedMethods.includes(m),
  ) ?? "DAYS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

// El % del control se copia a la tarea al crearla (en vez de dejarlo vacío
// heredando en silencio): así el usuario ve con qué umbral va a alertar y
// puede cambiarlo sin adivinar de dónde salía el número.
const emptyTask = (controlPercentage?: number | string) => ({
  action: "FUNCTIONAL_CHECK",
  is_on_condition: true,
  maintenance_provider_id: "",
  applied_date: undefined as unknown as Date,
  remaining_percentage: controlPercentage as number | undefined,
  intervals: [] as ReturnType<typeof emptyInterval>[],
});

const emptyItem = (controlPercentage?: number | string) => ({
  flags: [] as ControlItemFlag[],
  description: "",
  declared_description: "",
  part_number: "",
  serial: "",
  position: "",
  reference_document: "",
  tasks: [emptyTask(controlPercentage)],
});

/**
 * Rótulo que trunca sin comerse su ayuda: el texto cede ancho y el ícono
 * (si hay algo que aclarar) se queda. Lo comparten los campos de la tarjeta,
 * incluidos los que envuelven a mano un control de `_shared`.
 */
function FieldLabel({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <FormLabel className={cn(labelClass, "flex items-center gap-1")}>
      <span className="truncate">{children}</span>
      {tooltip && (
        <TooltipProvider disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="size-3 shrink-0 text-muted-foreground/60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-56">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </FormLabel>
  );
}

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
          <FieldLabel>{label}</FieldLabel>
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
}: {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  hint?: string;
}) {
  const tooltip = [optional && "Opcional.", hint].filter(Boolean).join(" ");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 space-y-1">
          <FieldLabel tooltip={tooltip || undefined}>{label}</FieldLabel>
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
 * dos o tres intervalos se vieran como un amontonamiento.
 */
const INTERVAL_GRID =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_32px]";

const INTERVAL_COLUMNS: { label: string; hint?: string }[] = [
  { label: "Unidad" },
  { label: "Límite" },
  {
    label: "Hrs/clc al cumplir",
    hint: "Horas o ciclos que marca la aeronave al cumplir esta tarea ahora. Es el punto de partida: el límite se cuenta desde ese número.",
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

  // Al pasar a días el campo desaparece: sin esto quedaría enviando al backend
  // una lectura que ya nadie ve ni puede corregir.
  const { setValue } = useFormContext<FormValues>();
  useEffect(() => {
    if (!isDays) return;
    setValue(`${namePrefix}.initial_value` as any, undefined);
    // setValue no es estable en RHF.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDays, namePrefix]);

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

      {/* Un límite en días corre por calendario: la lectura de la aeronave no
          entra en ese cálculo, así que la celda queda neutralizada — con un
          guion y no vacía, para que se lea como "no aplica" y la fila no se
          descuadre respecto de las de arriba. */}
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
  const isOnCondition = useWatch({
    control,
    name: `${namePrefix}.is_on_condition`,
  }) as boolean;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}.intervals`,
  });
  const intervals =
    (useWatch({ control, name: `${namePrefix}.intervals` }) as {
      counting_method: string;
    }[]) ?? [];
  const usedMethods = intervals.map((i) => i.counting_method).filter(Boolean);

  return (
    <div className="space-y-3 rounded-lg border border-slate-400/30 bg-muted/20 p-3 dark:border-slate-600/30">
      {/* Toda la cabecera de la tarea en una fila: qué es, si lleva plazo,
          quién la hizo y cuándo. Realizado por y la fecha se muestran aunque
          sea por condición — igual se cumple y se deja asentada; lo que no
          tiene es plazo. */}
      <div className="grid grid-cols-2 items-start gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,130px)_auto_32px]">
        <SelectField
          control={control}
          name={`${namePrefix}.action`}
          label="Tarea"
          options={Object.entries(AVIONICS_ACTION_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <FormItem className="min-w-0 space-y-1">
          <FieldLabel>Realizado por</FieldLabel>
          <ProviderSelect
            control={control}
            name={`${namePrefix}.maintenance_provider_id`}
          />
        </FormItem>
        <FormItem className="min-w-0 space-y-1">
          <FieldLabel tooltip="Fecha en que se cumplió esta tarea por última vez (el cumplimiento que está cargando, si es nuevo). Desde ahí se cuenta el próximo vencimiento.">
            Último cump.
          </FieldLabel>
          <CompactDateField
            control={control}
            name={`${namePrefix}.applied_date`}
          />
        </FormItem>
        {/* Va al final de la fila porque es lo que decide si abajo aparecen
            los límites: primero se lee la tarea, después lo que la condiciona. */}
        <FormField
          control={control}
          name={`${namePrefix}.is_on_condition`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <span className={cn(labelClass, "hidden lg:block")} aria-hidden>
                &nbsp;
              </span>
              <label className="flex h-11 cursor-pointer select-none items-center gap-2 text-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <span className="whitespace-nowrap">Por condición</span>
              </label>
            </FormItem>
          )}
        />
        {/* El rótulo fantasma baja el botón a la altura de los inputs; en dos
            columnas no hay rótulos al lado que igualar, así que se oculta. */}
        <div className="col-span-2 flex justify-end space-y-1 lg:col-span-1 lg:block">
          <span className={cn(labelClass, "hidden lg:block")} aria-hidden>
            &nbsp;
          </span>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Quitar tarea"
              className="h-11 w-8 shrink-0 text-muted-foreground/70 hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {!isOnCondition && (
        <>
          <div className="space-y-2 border-t border-slate-400/25 pt-3 dark:border-slate-600/25">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={labelClass}>
                Límites{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (varios = lo que ocurra primero)
                </span>
              </p>
              <div className="flex items-center gap-2">
                {/* El % vive con los límites, no con "Realizado por": solo
                    tiene sentido cuando hay un plazo del que avisar. */}
                <FieldLabel tooltip="Con cuánto remanente avisar que esta tarea está por vencer. Viene del % de Datos Básicos y se puede cambiar.">
                  Avisar al
                </FieldLabel>
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
        </>
      )}
    </div>
  );
}

function DeviceCard({
  control,
  index,
  onRemove,
}: {
  control: Control<any>;
  index: number;
  onRemove: () => void;
}) {
  const namePrefix = `items.${index}`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}.tasks`,
  });
  const description = useWatch({
    control,
    name: `${namePrefix}.description`,
  }) as string;
  const controlPercentage = useWatch({ control, name: "remaining_percentage" });

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-linear-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold">
          <span className="text-muted-foreground">#{index + 1}</span>{" "}
          {description || "Nuevo equipo"}
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
            <TooltipContent>Quitar equipo</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Identidad del equipo: qué es y cómo se lo reconoce físicamente. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <TextField
          control={control}
          name={`${namePrefix}.description`}
          label="Descripción"
          placeholder="EJ: ATC TRANSPONDER"
        />
        <TextField
          control={control}
          name={`${namePrefix}.part_number`}
          label="N° de Parte"
          placeholder="P/N"
        />
        <TextField
          control={control}
          name={`${namePrefix}.serial`}
          label="Serial"
          placeholder="S/N"
        />
      </div>

      <TextField
        control={control}
        name={`${namePrefix}.declared_description`}
        label="Descripción en formatos"
        placeholder="Cómo se redacta en la OT y los formatos INAC. Si se deja vacía se usa la descripción."
        optional
      />

      {/* Dónde está montado y de qué documento sale. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,90px)_minmax(0,1fr)]">
        <TextField
          control={control}
          name={`${namePrefix}.position`}
          label="Posición"
          placeholder="# 1"
          optional
        />
        <TextField
          control={control}
          name={`${namePrefix}.reference_document`}
          label="Documento de referencia"
          placeholder="EJ: AMM 3200/355 / RAV 135"
          optional
        />
      </div>

      <ControlItemFlagsField control={control} name={`${namePrefix}.flags`} />

      <div className="space-y-2 border-t border-slate-400/25 pt-3 dark:border-slate-600/25">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={labelClass}>
            Tareas{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (cada una lleva su propio reloj)
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(emptyTask(controlPercentage))}
            className="gap-1.5 border-dashed text-muted-foreground hover:text-primary"
          >
            <Plus className="size-3.5" />
            Agregar tarea
          </Button>
        </div>
        {fields.map((field, t) => (
          <TaskCard
            key={field.id}
            control={control}
            namePrefix={`${namePrefix}.tasks.${t}`}
            onRemove={() => remove(t)}
            canRemove={fields.length > 1}
          />
        ))}
        <FormField
          control={control}
          name={`${namePrefix}.tasks`}
          render={() => <FormMessage />}
        />
      </div>
    </div>
  );
}

function mapToFormItem(item: NonNullable<AvionicsControl["items"]>[number]) {
  return {
    id: item.id,
    flags: item.flags ?? [],
    description: item.description,
    declared_description: item.declared_description ?? "",
    part_number: item.part_number,
    serial: item.serial,
    position: item.position ?? "",
    reference_document: item.reference_document ?? "",
    tasks: item.tasks
      .filter((task) => !task.retired_at)
      .map((task) => ({
        id: task.id,
        action: task.action,
        is_on_condition: task.is_on_condition,
        maintenance_provider_id: task.maintenance_provider_id
          ? String(task.maintenance_provider_id)
          : "",
        applied_date: appliedDateOf(task.current_compliance),
        remaining_percentage:
          task.remaining_percentage !== null &&
          task.remaining_percentage !== undefined
            ? Number(task.remaining_percentage)
            : undefined,
        intervals: task.intervals.map((interval) => ({
          id: interval.id,
          counting_method: interval.counting_method,
          limit_value: Number(interval.limit_value),
          initial_value: appliedReadingOf(
            task.current_compliance,
            interval.counting_method,
          ),
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
    maintenance_catalog_manual_id: initialData.maintenance_catalog_manual_id
      ? Number(initialData.maintenance_catalog_manual_id)
      : undefined,
    remaining_percentage: Number(initialData.remaining_percentage),
    items: (initialData.items ?? [])
      .filter((i) => !i.retired_at)
      .map(mapToFormItem),
  };
}

export default function CreateAvionicsControlForm({
  initialData,
}: {
  initialData?: AvionicsControl;
}) {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const isEditing = !!initialData;
  const [reason, setReason] = useState<EditReasonValue>({});
  const [reasonError, setReasonError] = useState<string>();
  const { createAvionicsControl } = useCreateAvionicsControl();
  const { updateAvionicsControl } = useUpdateAvionicsControl();
  const { data: avionicsControls } = useGetAvionicsControls(
    selectedCompany?.slug,
    true,
  );

  const excludeAircraftIds = useMemo(
    () =>
      (avionicsControls ?? [])
        .filter((c) => c.id !== initialData?.id)
        .map((c) => String(c.aircraft_id)),
    [avionicsControls, initialData?.id],
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
  const controlPercentage = useWatch({ control, name: "remaining_percentage" });

  useSuggestedControlTitle(form, "Aviónica");
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
        flags: item.flags ?? [],
        description: item.description,
        declared_description: item.declared_description?.trim() || undefined,
        part_number: item.part_number,
        serial: item.serial,
        position: item.position || undefined,
        reference_document: item.reference_document || undefined,
        tasks: item.tasks.map((task) => ({
          id: task.id,
          action: task.action as AvionicsAction,
          is_on_condition: task.is_on_condition ?? false,
          // Quién la hizo y cuándo se envían siempre: una tarea por condición
          // igual se cumple y deja registro. Lo que no tiene es plazo, y por
          // eso el % de alerta y los intervalos sí quedan vacíos.
          maintenance_provider_id: task.maintenance_provider_id || undefined,
          applied_date: task.applied_date
            ? format(task.applied_date, "yyyy-MM-dd")
            : undefined,
          remaining_percentage: task.is_on_condition
            ? null
            : (task.remaining_percentage ?? null),
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
      if (isDirty && !reason.edit_reason) {
        setReasonError("Indique el motivo de la corrección.");
        return;
      }

      try {
        await updateAvionicsControl.mutateAsync({
          id: initialData.id,
          company: selectedCompany!.slug,
          data: { ...payload, ...reason },
        });
      } catch (error) {
        setReasonError(editReasonErrorFrom(error));
        return;
      }
    } else {
      await createAvionicsControl.mutateAsync({
        company: selectedCompany!.slug,
        data: payload,
      });
    }

    router.push(`/${selectedCompany!.slug}/planificacion/control_avionica`);
  };

  const isPending =
    createAvionicsControl.isPending || updateAvionicsControl.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, notifyInvalidForm(form))}
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
              hint="Solo se listan las que aún no tienen un control de aviónica."
            />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="EJ: Control de Aviónica YV2272"
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
                          placeholder="EJ: AMM 3200/355 / RAV 135"
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
          <FormSection
            icon={Radio}
            title="Equipos de Aviónica"
            hint='La mayoría va "por condición" (solo se lista y verifica); los que tienen plazo llevan sus tareas con fecha e intervalos.'
          >
            <div className="space-y-4">
              {fields.map((field, index) => (
                <DeviceCard
                  key={field.id}
                  control={control}
                  index={index}
                  onRemove={() => remove(index)}
                />
              ))}
              {fields.length === 0 && (
                <p className={cn(hintClass, "italic")}>
                  Agregue los equipos de aviónica instalados en esta aeronave.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyItem(controlPercentage))}
                className="gap-1.5 border-dashed text-muted-foreground hover:border-blue-400/40 hover:text-primary"
              >
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
            <p>{isEditing ? "Guardar Cambios" : "Crear Control de Aviónica"}</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
