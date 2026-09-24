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
  Loader2,
  Plane,
  Plus,
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
import { useGetDirectiveControls } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControls";
import {
  useCreateDirectiveControl,
  useUpdateDirectiveControl,
} from "@/actions/mantenimiento/planificacion/control_directivas/actions";
import { CreateMaintenanceProviderDialog } from "@/components/dialogs/mantenimiento/planificacion/CreateMaintenanceProviderDialog";
import {
  DirectiveApplicability,
  DirectiveAuthority,
  DirectiveComplianceType,
  DirectiveControl,
} from "@/types";
import {
  DIRECTIVE_APPLICABILITY_LABELS,
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
const applicabilityEnum = z.enum(
  Object.keys(DIRECTIVE_APPLICABILITY_LABELS) as [string, ...string[]],
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
  remaining_percentage: optionalPercentage,
  observations: z.string().optional(),
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

        if (
          (item.applicability === "NOT_APPLICABLE" ||
            item.applicability === "SUPERSEDED") &&
          !item.applicability_notes?.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              item.applicability === "SUPERSEDED"
                ? "Indique qué AD la supersede"
                : "Indique el motivo (por modelo, por serial, por modificación...)",
            path: [...path, "applicability_notes"],
          });
        }

        if (item.applicability !== "APPLICABLE") return;

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
            message: "Una AD recurrente necesita al menos un intervalo",
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
              "Indique la fecha de referencia desde la que corre el plazo",
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
  remaining_percentage: undefined as number | undefined,
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
          <Select
            onValueChange={field.onChange}
            value={field.value || undefined}
          >
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
            {optional && (
              <span className="ml-1 text-xs text-muted-foreground">
                (Opcional)
              </span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              className={fieldClass}
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
    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[110px_1fr_1fr_32px]">
      <FormField
        control={control}
        name={`${namePrefix}.counting_method`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>Unidad</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
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
      <FormField
        control={control}
        name={`${namePrefix}.limit_value`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>Plazo ({unitShort})</FormLabel>
            <FormControl>
              <NumericInput
                placeholder="0"
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
      {isDays ? (
        <div className="space-y-1">
          <p className={labelClass}>Lectura del conjunto</p>
          <div
            className={cn(
              fieldClass,
              "flex items-center justify-center text-sm text-muted-foreground/40 shadow-none",
            )}
          >
            —
          </div>
        </div>
      ) : (
        <FormField
          control={control}
          name={`${namePrefix}.initial_value`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className={labelClass}>
                Conjunto en la referencia ({unitShort})
              </FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
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
      )}
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
  const adNumber = useWatch({
    control,
    name: `${namePrefix}.ad_number`,
  }) as string;
  const applicability = useWatch({
    control,
    name: `${namePrefix}.applicability`,
  }) as DirectiveApplicability;
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

  const isApplicable = applicability === "APPLICABLE";
  const needsNotes =
    applicability === "NOT_APPLICABLE" || applicability === "SUPERSEDED";
  const isRecurrent = complianceType === "RECURRENT";

  return (
    <div className="space-y-3 rounded-xl border border-slate-400/40 bg-linear-to-br from-background/70 to-background/40 p-4 backdrop-blur-md dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_110px_1fr]">
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
        <TextField
          control={control}
          name={`${namePrefix}.description`}
          label="Asunto"
          placeholder="EJ: Inspección de tren de aterrizaje principal"
        />
        <TextField
          control={control}
          name={`${namePrefix}.reference_document`}
          label="Documento de referencia"
          placeholder="EJ: SB 407-32-101"
          optional
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr]">
        <SelectField
          control={control}
          name={`${namePrefix}.applicability`}
          label="Aplicabilidad"
          options={Object.entries(DIRECTIVE_APPLICABILITY_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <SelectField
          control={control}
          name={`${namePrefix}.compliance_type`}
          label="Tipo de cumplimiento"
          options={Object.entries(DIRECTIVE_COMPLIANCE_TYPE_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <TextField
          control={control}
          name={`${namePrefix}.compliance_method`}
          label="Método de cumplimiento"
          placeholder="EJ: Inspección visual párrafo (e)"
          optional
        />
      </div>

      {needsNotes && (
        <TextField
          control={control}
          name={`${namePrefix}.applicability_notes`}
          label={
            applicability === "SUPERSEDED"
              ? "Supersedida por"
              : "Motivo de no aplicabilidad"
          }
          placeholder={
            applicability === "SUPERSEDED"
              ? "EJ: AD 2021-12-08"
              : "EJ: Por serial — aplica a S/N 53000 a 53999"
          }
        />
      )}

      {isApplicable && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_110px]">
            <div className="space-y-1">
              <p className={labelClass}>
                Realizado por
                {!isRecurrent && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (Opcional)
                  </span>
                )}
              </p>
              <ProviderSelect
                control={control}
                name={`${namePrefix}.maintenance_provider_id`}
              />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>
                {isRecurrent ? "Último cumplimiento" : "Fecha de referencia"}
              </p>
              <CompactDateField
                control={control}
                name={`${namePrefix}.first_applied_date`}
              />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>
                % Alerta{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Opcional)
                </span>
              </p>
              <RemainingPercentageField
                control={control}
                name={`${namePrefix}.remaining_percentage`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={labelClass}>
                {isRecurrent ? "Intervalos" : "Plazo para cumplir"}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {isRecurrent
                    ? "(varios = lo que ocurra primero)"
                    : "(vacío si ya se cumplió o no tiene plazo)"}
                </span>
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
                  Agregar {isRecurrent ? "intervalo" : "plazo"}
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
              />
            ))}
            <FormField
              control={control}
              name={`${namePrefix}.intervals`}
              render={() => <FormMessage />}
            />
          </div>
        </>
      )}

      <FormField
        control={control}
        name={`${namePrefix}.observations`}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className={labelClass}>
              Observaciones{" "}
              <span className="text-xs text-muted-foreground">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="..."
                className={cn(fieldClass, "h-auto min-h-9 resize-none py-2")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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
    ad_number: item.ad_number,
    authority: item.authority,
    revision: item.revision ?? "",
    description: item.description,
    reference_document: item.reference_document ?? "",
    compliance_method: item.compliance_method ?? "",
    applicability: item.applicability,
    applicability_notes: item.applicability_notes ?? "",
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
    observations: item.observations ?? "",
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
      items: allItems.map((item) => {
        const applicable = item.applicability === "APPLICABLE";
        return {
          id: item.id,
          parent_aircraft_part_id: item.aircraft_part_id
            ? Number(item.aircraft_part_id)
            : null,
          ad_number: item.ad_number,
          authority: item.authority as DirectiveAuthority,
          revision: item.revision || undefined,
          description: item.description,
          reference_document: item.reference_document || undefined,
          compliance_method: item.compliance_method || undefined,
          applicability: item.applicability as DirectiveApplicability,
          applicability_notes: item.applicability_notes || undefined,
          compliance_type: item.compliance_type as DirectiveComplianceType,
          maintenance_provider_id: applicable
            ? item.maintenance_provider_id || undefined
            : undefined,
          first_applied_date:
            applicable && item.first_applied_date
              ? format(item.first_applied_date, "yyyy-MM-dd")
              : undefined,
          remaining_percentage: applicable
            ? (item.remaining_percentage ?? null)
            : null,
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <FormLabel className={labelClass}>
                    % de Remanente para Alerta
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <NumericInput
                        className={cn(fieldClass, "pr-8")}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className={hintClass}>
                    Con cuánto remanente sobre el plazo se avisa que una AD está
                    próxima a vencer.
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
                    "h-auto shadow-none md:col-span-2 flex flex-row items-start space-x-3 space-y-0 p-4 hover:shadow-none",
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
              <>
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
              </>
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
