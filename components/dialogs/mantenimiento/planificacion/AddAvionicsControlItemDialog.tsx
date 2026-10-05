"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { DatePickerField } from "@/components/ui/DatePickerField";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useAddAvionicsControlItem } from "@/actions/mantenimiento/planificacion/control_avionica/actions";
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
import { AVIONICS_ACTION_LABELS } from "@/lib/avionicsControlLabels";

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

const taskSchema = z
  .object({
    action: z.enum([
      "FUNCTIONAL_CHECK",
      "CERTIFICATION",
      "CALIBRATION",
      "REPLACEMENT",
      "DATA_DOWNLOAD",
    ]),
    is_on_condition: z.boolean().default(false),
    maintenance_provider_id: z.string().optional(),
    first_applied_date: z.date().optional(),
    remaining_percentage: optionalPercentage,
    intervals: z.array(intervalSchema).default([]),
  })
  .superRefine((vals, ctx) => {
    if (vals.is_on_condition) return;

    if (!vals.first_applied_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique la fecha del último evento",
        path: ["first_applied_date"],
      });
    }
    if (!vals.maintenance_provider_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indique quién realizó esta tarea",
        path: ["maintenance_provider_id"],
      });
    }
    if (!vals.intervals.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agregue al menos un intervalo (o márquela por condición)",
        path: ["intervals"],
      });
    }

    const seenMethods = new Set<string>();
    vals.intervals.forEach((interval, index) => {
      if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique las horas/ciclos de la aeronave en ese evento",
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

const formSchema = z.object({
  description: z.string().min(1, "Requerido"),
  part_number: z.string().min(1, "Requerido"),
  serial: z.string().min(1, "Requerido"),
  position: z.string().optional(),
  is_hazardous: z.boolean().default(false),
  reference_document: z.string().optional(),
  tasks: z.array(taskSchema).min(1, "Agregue al menos una tarea"),
});

type FormValues = z.infer<typeof formSchema>;

const emptyInterval = (usedMethods: string[] = []) => ({
  counting_method: (ALL_COUNTING_METHODS.find((m) => !usedMethods.includes(m)) ??
    "HOURS") as "HOURS" | "CYCLES" | "DAYS",
  limit_value: undefined as unknown as number,
});

const emptyTask = () => ({
  action: "FUNCTIONAL_CHECK" as const,
  is_on_condition: false,
  maintenance_provider_id: "",
  first_applied_date: undefined,
  intervals: [emptyInterval()],
});

function TaskIntervalRow({
  control,
  taskIndex,
  intervalIndex,
  usedMethods,
  onRemove,
  canRemove,
}: {
  control: Control<FormValues>;
  taskIndex: number;
  intervalIndex: number;
  usedMethods: string[];
  onRemove: () => void;
  canRemove: boolean;
}) {
  const namePrefix = `tasks.${taskIndex}.intervals.${intervalIndex}` as const;
  const countingMethod = useWatch({ control, name: `${namePrefix}.counting_method` });
  const needsInitialReading = countingMethod && countingMethod !== "DAYS";
  const availableMethods = ALL_COUNTING_METHODS.filter(
    (unit) => unit === countingMethod || !usedMethods.includes(unit),
  );

  return (
    <div className="grid grid-cols-[100px_100px_1fr_32px] items-start gap-2">
      <FormField
        control={control}
        name={`${namePrefix}.counting_method`}
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
        name={`${namePrefix}.limit_value`}
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
          name={`${namePrefix}.initial_value`}
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

function TaskRow({
  control,
  index,
  onRemove,
  canRemove,
}: {
  control: Control<FormValues>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const namePrefix = `tasks.${index}` as const;
  const isOnCondition = useWatch({ control, name: `${namePrefix}.is_on_condition` });
  const {
    fields: intervalFields,
    append: appendInterval,
    remove: removeInterval,
  } = useFieldArray({ control, name: `${namePrefix}.intervals` });
  const intervals = useWatch({ control, name: `${namePrefix}.intervals` });
  const usedMethods = (intervals ?? []).map((i) => i.counting_method).filter(Boolean);
  const canAddInterval = intervalFields.length < ALL_COUNTING_METHODS.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-400/40 p-3 dark:border-slate-600/40">
      <div className="flex items-center justify-between gap-2">
        <FormField
          control={control}
          name={`${namePrefix}.action`}
          render={({ field }) => (
            <FormItem className="w-full max-w-60 space-y-0">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(AVIONICS_ACTION_LABELS).map(([value, label]) => (
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

      <FormField
        control={control}
        name={`${namePrefix}.is_on_condition`}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="cursor-pointer font-normal">Por condición (sin plazo)</FormLabel>
          </FormItem>
        )}
      />

      {!isOnCondition && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${namePrefix}.first_applied_date`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <DatePickerField
                    label="Último Evento"
                    value={field.value}
                    setValue={(date) => field.onChange(date ?? undefined)}
                    maxDate={new Date()}
                    required
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="w-full space-y-2">
              <FormLabel className={labelClass}>Realizado Por</FormLabel>
              <ProviderSelect
                control={control as Control<any>}
                name={`${namePrefix}.maintenance_provider_id`}
              />
            </FormItem>
          </div>

          <FormField
            control={control}
            name={`${namePrefix}.remaining_percentage`}
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

          <div className="flex flex-col gap-2">
            {intervalFields.map((field, intervalIndex) => (
              <TaskIntervalRow
                key={field.id}
                control={control}
                taskIndex={index}
                intervalIndex={intervalIndex}
                usedMethods={usedMethods.filter((_, i) => i !== intervalIndex)}
                onRemove={() => removeInterval(intervalIndex)}
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
        </>
      )}
    </div>
  );
}

interface AddAvionicsControlItemDialogProps {
  controlId: number | string;
}

/**
 * "Añadir Ítem" — alta de un equipo (con sus tareas) sobre un control de
 * aviónica YA EXISTENTE, sin pasar por Editar. Sin cumplimiento inicial: el
 * cumplimiento es por TAREA, no por equipo, y se registra después desde el
 * detalle con el flujo normal una vez creado.
 */
export function AddAvionicsControlItemDialog({
  controlId,
}: AddAvionicsControlItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { addAvionicsControlItem } = useAddAvionicsControlItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      part_number: "",
      serial: "",
      position: "",
      is_hazardous: false,
      reference_document: "",
      tasks: [emptyTask()],
    },
  });

  const { control } = form;
  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({ control, name: "tasks" });

  const resetAndClose = () => {
    form.reset();
    setOpen(false);
  };

  const onSubmit = async (values: FormValues) => {
    await addAvionicsControlItem.mutateAsync({
      company: selectedCompany!.slug,
      controlId,
      data: {
        description: values.description,
        part_number: values.part_number,
        serial: values.serial,
        position: values.position || undefined,
        is_hazardous: values.is_hazardous,
        reference_document: values.reference_document || undefined,
        tasks: values.tasks.map((task) => ({
          action: task.action,
          is_on_condition: task.is_on_condition,
          maintenance_provider_id: task.is_on_condition
            ? undefined
            : task.maintenance_provider_id,
          first_applied_date: task.is_on_condition
            ? undefined
            : task.first_applied_date
              ? format(task.first_applied_date, "yyyy-MM-dd")
              : undefined,
          remaining_percentage: task.is_on_condition
            ? null
            : task.remaining_percentage ?? null,
          intervals: task.is_on_condition ? [] : task.intervals,
        })),
      },
    });

    resetAndClose();
  };

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
              <span className="sr-only">Añadir equipo</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Añadir equipo a Aviónica</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Añadir Equipo</DialogTitle>
          <DialogDescription>
            Registra un equipo nuevo (con sus tareas) en este control sin tocar los demás.
          </DialogDescription>
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
                    <Input placeholder="EJ: Transpondedor" className={fieldClass} {...field} />
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

            <FormField
              control={control}
              name="is_hazardous"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    Es un material peligroso
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormSection title="Tareas">
              <div className="flex flex-col gap-3">
                {taskFields.map((field, index) => (
                  <TaskRow
                    key={field.id}
                    control={control}
                    index={index}
                    onRemove={() => removeTask(index)}
                    canRemove={taskFields.length > 1}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit gap-1.5"
                  onClick={() => appendTask(emptyTask())}
                >
                  <Plus className="size-3.5" />
                  Añadir otra tarea
                </Button>
              </div>
            </FormSection>

            <Button
              className="h-11 gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
              disabled={addAvionicsControlItem.isPending}
              type="submit"
            >
              {addAvionicsControlItem.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Añadir Ítem</p>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
