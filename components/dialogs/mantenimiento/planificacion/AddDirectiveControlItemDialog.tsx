"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  useAddDirectiveControlItem,
} from "@/actions/mantenimiento/planificacion/control_directivas/actions";
import {
  FormSection,
  fieldClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";
import {
  NumericInput,
  ProviderSelect,
} from "@/components/forms/mantenimiento/planificacion/_shared";
import {
  DIRECTIVE_AUTHORITY_LABELS,
  DIRECTIVE_COMPLIANCE_TYPE_LABELS,
} from "@/lib/directiveControlLabels";

const ALL_COUNTING_METHODS = ["HOURS", "CYCLES", "DAYS"] as const;
const COUNTING_METHOD_LABEL: Record<string, string> = {
  HOURS: "Horas",
  CYCLES: "Ciclos",
  DAYS: "Días",
};

const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

const optionalPercentage = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0, "Debe ser ≥ 0").max(100, "Debe ser ≤ 100").optional(),
);

const intervalSchema = z.object({
  counting_method: z.enum(["HOURS", "CYCLES", "DAYS"]),
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  initial_value: optionalNumeric,
});

const formSchema = z
  .object({
    maintenance_provider_id: z.string().optional(),
    ad_number: z.string().min(1, "Requerido"),
    authority: z.enum(["INAC", "FAA", "EASA", "OTHER"]),
    revision: z.string().optional(),
    description: z.string().min(1, "Requerido"),
    declared_description: z.string().optional(),
    reference_document: z.string().optional(),
    compliance_method: z.string().optional(),
    compliance_type: z.enum(["ONE_TIME", "RECURRENT"]),
    applied_date: z.date().optional(),
    remaining_percentage: optionalPercentage,
    intervals: z.array(intervalSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.compliance_type === "RECURRENT") {
      if (!vals.applied_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Una AD recurrente necesita la fecha de su último cumplimiento",
          path: ["applied_date"],
        });
      }
      if (!vals.intervals.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Una AD recurrente necesita al menos un límite de recurrencia",
          path: ["intervals"],
        });
      }
    }

    if (vals.compliance_type === "ONE_TIME" && vals.intervals.length && !vals.applied_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique la fecha desde la que corre el límite de la AD",
        path: ["applied_date"],
      });
    }

    const seenMethods = new Set<string>();
    vals.intervals.forEach((interval, index) => {
      if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique las horas/ciclos del conjunto al cumplir la AD",
          path: ["intervals", index, "initial_value"],
        });
      }
      if (seenMethods.has(interval.counting_method)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "No puede repetir la misma unidad en dos intervalos",
          path: ["intervals", index, "counting_method"],
        });
      }
      seenMethods.add(interval.counting_method);
    });

  });

type FormValues = z.infer<typeof formSchema>;

const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (ALL_COUNTING_METHODS.find((m) => !usedMethods.includes(m)) ??
    "HOURS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

function IntervalRow({
  control,
  index,
  usedMethods,
  onRemove,
  canRemove,
}: {
  control: Control<FormValues>;
  index: number;
  usedMethods: string[];
  onRemove: () => void;
  canRemove: boolean;
}) {
  const countingMethod = useWatch({ control, name: `intervals.${index}.counting_method` });
  const needsInitialReading = countingMethod && countingMethod !== "DAYS";
  const availableMethods = ALL_COUNTING_METHODS.filter(
    (unit) => unit === countingMethod || !usedMethods.includes(unit),
  );

  return (
    <div className="grid grid-cols-[100px_100px_1fr_32px] items-start gap-2">
      <FormField
        control={control}
        name={`intervals.${index}.counting_method`}
        render={({ field }) => (
          <FormItem className="space-y-0">
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableMethods.map((unit) => (
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
        name={`intervals.${index}.limit_value`}
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormControl>
              <NumericInput
                placeholder="Límite"
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
      {needsInitialReading ? (
        <FormField
          control={control}
          name={`intervals.${index}.initial_value`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <NumericInput
                  placeholder="Lectura inicial"
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
      ) : (
        <div />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground/70 hover:text-destructive disabled:opacity-30"
        onClick={onRemove}
        disabled={!canRemove}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

interface AddDirectiveControlItemDialogProps {
  controlId: number | string;
  /** Fijo a la sección: `undefined` = Aeronave (nivel fuselaje). */
  aircraftPartId?: number | string;
  /** Nombre de la sección, para el tooltip del botón. */
  sectionLabel: string;
  currentHours: number;
  currentCycles: number;
}

/**
 * "Añadir Ítem" — alta de una AD suelta sobre un control de directivas YA
 * EXISTENTE, sin pasar por Editar. Vive como icon-button dentro de la
 * sección a la que pertenece (Aeronave o la de cada parte): el conjunto
 * queda fijo por esa sección, no se elige en el formulario. El cumplimiento
 * inicial es opcional: si se marca, se encadenan dos peticiones (crear AD,
 * luego su cumplimiento).
 */
export function AddDirectiveControlItemDialog({
  controlId,
  aircraftPartId,
  sectionLabel,
  currentHours,
  currentCycles,
}: AddDirectiveControlItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { addDirectiveControlItem } = useAddDirectiveControlItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenance_provider_id: "",
      ad_number: "",
      authority: "INAC",
      revision: "",
      description: "",
      declared_description: "",
      reference_document: "",
      compliance_method: "",
      compliance_type: "RECURRENT",
      applied_date: undefined,
      remaining_percentage: undefined,
      intervals: [emptyInterval()],
    },
  });

  const { control } = form;
  const complianceType = useWatch({ control, name: "compliance_type" });
  const isRecurrent = complianceType === "RECURRENT";
  const {
    fields: intervalFields,
    append: appendInterval,
    remove: removeInterval,
  } = useFieldArray({ control, name: "intervals" });
  const intervals = useWatch({ control, name: "intervals" });
  const usedMethods = (intervals ?? []).map((i) => i.counting_method).filter(Boolean);
  const canAddInterval = intervalFields.length < ALL_COUNTING_METHODS.length;

  const resetAndClose = () => {
    form.reset();
    setOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    const item = await addDirectiveControlItem.mutateAsync({
      company: selectedCompany!.slug,
      controlId,
      data: {
        aircraft_part_id: aircraftPartId
          ? Number(aircraftPartId)
          : null,
        maintenance_provider_id: values.maintenance_provider_id || undefined,
        ad_number: values.ad_number,
        authority: values.authority,
        revision: values.revision || undefined,
        description: values.description,
        declared_description: values.declared_description?.trim() || undefined,
        reference_document: values.reference_document || undefined,
        compliance_method: values.compliance_method || undefined,
        compliance_type: values.compliance_type,
        applied_date: values.applied_date
          ? format(values.applied_date, "yyyy-MM-dd")
          : undefined,
        remaining_percentage: values.remaining_percentage ?? null,
        intervals: values.intervals,
      },
    });

    resetAndClose();
  };

  const isPending = addDirectiveControlItem.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4" />
              <span className="sr-only">Añadir AD</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Añadir AD a {sectionLabel}</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Directiva</DialogTitle>
          <DialogDescription>{sectionLabel}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name="ad_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>N° de AD</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="authority"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Autoridad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DIRECTIVE_AUTHORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="revision"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Revisión <span className="text-muted-foreground text-xs">(Opc.)</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Descripción</FormLabel>
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
              name="declared_description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    Descripción en formatos (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Cómo se redacta en la OT y los formatos INAC. Si se deja vacía se usa la descripción."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="compliance_type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Tipo de Cumplimiento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DIRECTIVE_COMPLIANCE_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="reference_document"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Doc. de Referencia{" "}
                      <span className="text-muted-foreground text-xs">(Opc.)</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="compliance_method"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Método <span className="text-muted-foreground text-xs">(Opc.)</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="applied_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <DatePickerField
                      label={isRecurrent ? "Último Cumplimiento" : "Fecha de Referencia"}
                      value={field.value}
                      setValue={(date) => field.onChange(date ?? undefined)}
                      maxDate={new Date()}
                      required={isRecurrent}
                    />
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
                      % Alerta <span className="text-muted-foreground text-xs">(Opc.)</span>
                    </FormLabel>
                    <FormControl>
                      <NumericInput
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
            </div>

            <FormSection
              title={isRecurrent ? "Límites de Recurrencia" : "Límite (Opcional)"}
            >
              <div className="flex flex-col gap-2">
                {intervalFields.map((field, index) => (
                  <IntervalRow
                    key={field.id}
                    control={control}
                    index={index}
                    usedMethods={usedMethods.filter((_, i) => i !== index)}
                    onRemove={() => removeInterval(index)}
                    canRemove={intervalFields.length > 1}
                  />
                ))}
                {canAddInterval && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit gap-1.5"
                    onClick={() => appendInterval(emptyInterval(usedMethods))}
                  >
                    <Plus className="size-3.5" />
                    Ó este otro límite
                  </Button>
                )}
                {!intervalFields.length && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit gap-1.5"
                    onClick={() => appendInterval(emptyInterval())}
                  >
                    <Plus className="size-3.5" />
                    Agregar límite
                  </Button>
                )}
              </div>
            </FormSection>

            <FormItem className="w-full space-y-2">
              <FormLabel className={labelClass}>
                Realizado Por <span className="text-muted-foreground text-xs">(Opc.)</span>
              </FormLabel>
              <ProviderSelect
                control={control as Control<any>}
                name="maintenance_provider_id"
              />
            </FormItem>

            <Button
              className="h-11 gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
              disabled={isPending}
              type="submit"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Añadir Ítem</p>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
