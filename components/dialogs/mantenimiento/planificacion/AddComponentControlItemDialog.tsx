"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONTROL_ITEM_FLAGS } from "@/lib/controlItemFlags";
import { ControlItemFlagsField } from "@/components/forms/mantenimiento/planificacion/ControlItemFlagsField";
import { Textarea } from "@/components/ui/textarea";
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
  useAddComponentControlItem,
} from "@/actions/mantenimiento/planificacion/control_componentes/actions";
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
  COMPONENT_ACTION_LABELS,
  COMPONENT_LIMIT_KIND_LABELS,
} from "@/lib/componentControlLabels";

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
  limit_kind: z.enum(["HARD_TIME", "LIFE_LIMIT"]),
  limit_value: z.coerce.number().positive("Debe ser mayor a 0"),
  initial_value: optionalNumeric,
  consumed_at_event: optionalNumeric,
});

const formSchema = z
  .object({
    maintenance_provider_id: z.string().min(1, "Seleccione quién lo realiza"),
    flags: z.array(z.enum(CONTROL_ITEM_FLAGS)).default([]),
    description: z.string().min(1, "Requerido"),
    declared_description: z.string().optional(),
    part_number: z.string().min(1, "Requerido"),
    serial: z.string().min(1, "Requerido"),
    position: z.string().optional(),
    action: z.enum(["OVERHAUL", "CHECK", "TEST"]),
    reference_document: z.string().optional(),
    applied_date: z.date({ error: "Seleccione una fecha" }),
    remaining_percentage: optionalPercentage,
    intervals: z.array(intervalSchema).min(1, "Agregue al menos un intervalo"),
    consumed_hours: optionalNumeric,
    consumed_cycles: optionalNumeric,
  })
  .superRefine((vals, ctx) => {
    const seenMethods = new Set<string>();
    vals.intervals.forEach((interval, index) => {
      if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique las horas/ciclos del padre en ese evento",
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
  limit_kind: "HARD_TIME" as "HARD_TIME" | "LIFE_LIMIT",
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
    <div className="grid grid-cols-[90px_100px_90px_1fr_32px] items-start gap-2">
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
        name={`intervals.${index}.limit_kind`}
        render={({ field }) => (
          <FormItem className="space-y-0">
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(COMPONENT_LIMIT_KIND_LABELS).map(([value, label]) => (
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

interface AddComponentControlItemDialogProps {
  controlId: number | string;
  /** Fijo a la sección: `undefined` = Fuselaje (nivel aeronave). */
  aircraftPartId?: number | string;
  /** Nombre de la sección, para el tooltip del botón. */
  sectionLabel: string;
  currentHours: number;
  currentCycles: number;
}

/**
 * "Añadir Ítem" — alta de un componente suelto sobre un control de
 * componentes YA EXISTENTE, sin pasar por Editar. Vive como icon-button
 * dentro de la sección a la que pertenece (Fuselaje o la de cada parte): el
 * conjunto queda fijo por esa sección, no se elige en el formulario. El
 * cumplimiento inicial es opcional: si se marca, se encadenan dos
 * peticiones (crear ítem, luego su cumplimiento); si la segunda falla, el
 * ítem ya quedó creado.
 */
export function AddComponentControlItemDialog({
  controlId,
  aircraftPartId,
  sectionLabel,
  currentHours,
  currentCycles,
}: AddComponentControlItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { addComponentControlItem } = useAddComponentControlItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenance_provider_id: "",
      flags: [],
      description: "",
      declared_description: "",
      part_number: "",
      serial: "",
      position: "",
      action: "OVERHAUL",
      reference_document: "",
      applied_date: undefined,
      remaining_percentage: undefined,
      intervals: [emptyInterval()],
      consumed_hours: 0,
      consumed_cycles: 0,
    },
  });

  const { control } = form;
  const action = useWatch({ control, name: "action" });
  const keepsConsumed = action !== "OVERHAUL";
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
    const item = await addComponentControlItem.mutateAsync({
      company: selectedCompany!.slug,
      controlId,
      data: {
        aircraft_part_id: aircraftPartId
          ? Number(aircraftPartId)
          : null,
        maintenance_provider_id: values.maintenance_provider_id,
        flags: values.flags,
        description: values.description,
        declared_description: values.declared_description?.trim() || undefined,
        part_number: values.part_number,
        serial: values.serial,
        position: values.position || undefined,
        action: values.action,
        reference_document: values.reference_document || undefined,
        applied_date: format(values.applied_date, "yyyy-MM-dd"),
        remaining_percentage: values.remaining_percentage ?? null,
        intervals: values.intervals,
      },
    });

    resetAndClose();
  };

  const isPending = addComponentControlItem.isPending;

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
              <span className="sr-only">Añadir componente</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Añadir componente a {sectionLabel}</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Componente</DialogTitle>
          <DialogDescription>{sectionLabel}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Bomba Hidráulica" className={fieldClass} {...field} />
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={control}
                name="part_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Parte N°</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="serial"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Serial</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="position"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>
                      Posición <span className="text-muted-foreground text-xs">(Opc.)</span>
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
                name="action"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Acción</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(COMPONENT_ACTION_LABELS).map(([value, label]) => (
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
              <FormItem className="w-full space-y-2">
                <FormLabel className={labelClass}>Realizado Por</FormLabel>
                <ProviderSelect
                  control={control as Control<any>}
                  name="maintenance_provider_id"
                />
              </FormItem>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="applied_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <DatePickerField
                      label="1ra Aplicación"
                      value={field.value}
                      setValue={(date) => field.onChange(date ?? undefined)}
                      maxDate={new Date()}
                      required
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

            <ControlItemFlagsField control={control as unknown as Control<any>} name="flags" />

            <FormSection title="Límites de Vencimiento">
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
              </div>
            </FormSection>

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
