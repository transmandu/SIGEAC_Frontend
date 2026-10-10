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
import { useAddMaintenanceControlItem } from "@/actions/mantenimiento/planificacion/control_mantenimiento/actions";
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
    description: z.string().min(1, "Requerido"),
    declared_description: z.string().optional(),
    applied_date: z.date({ error: "Seleccione una fecha" }),
    remaining_percentage: optionalPercentage,
    maintenance_provider_id: z.string().optional(),
    intervals: z.array(intervalSchema).min(1, "Agregue al menos un intervalo"),
  })
  .superRefine((vals, ctx) => {
    const seenMethods = new Set<string>();
    vals.intervals.forEach((interval, index) => {
      if (interval.counting_method !== "DAYS" && interval.initial_value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique las horas/ciclos que tenía la aeronave en la primera aplicación",
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

interface AddMaintenanceControlItemDialogProps {
  controlId: number | string;
  itemType: "CERTIFICATE" | "SERVICE";
  /** Fijo a la sección: `undefined` = nivel aeronave (Certificados/Servicios de Aeronave). */
  aircraftPartId?: number | string;
  /** Nombre de la sección, para el tooltip del botón ("Añadir a Certificados"). */
  sectionLabel: string;
  currentHours: number;
  currentCycles: number;
}

/**
 * "Añadir Ítem" — alta de un certificado o servicio suelto sobre un control
 * YA EXISTENTE, sin pasar por Editar (que exige reenviar/confirmar todos los
 * demás ítems). Vive como icon-button dentro de la sección a la que
 * pertenece (Certificados, Servicios de Aeronave, o la de cada parte): la
 * categoría y el conjunto quedan fijos por esa sección, no se eligen en el
 * formulario. El cumplimiento inicial es opcional: si se marca, se envían
 * dos peticiones encadenadas (crear ítem, luego su cumplimiento); si la
 * segunda falla, el ítem ya quedó creado y se avisa por separado.
 */
export function AddMaintenanceControlItemDialog({
  controlId,
  itemType,
  aircraftPartId,
  sectionLabel,
  currentHours,
  currentCycles,
}: AddMaintenanceControlItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { addMaintenanceControlItem } = useAddMaintenanceControlItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      declared_description: "",
      applied_date: undefined,
      remaining_percentage: undefined,
      maintenance_provider_id: "",
      intervals: [emptyInterval()],
    },
  });

  const { control } = form;
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
    if (itemType === "SERVICE" && !values.maintenance_provider_id) {
      form.setError("maintenance_provider_id", {
        message: "Seleccione quién lo realiza",
      });
      return;
    }

    const item = await addMaintenanceControlItem.mutateAsync({
      company: selectedCompany!.slug,
      controlId,
      data: {
        item_type: itemType,
        aircraft_part_id: aircraftPartId ? Number(aircraftPartId) : undefined,
        description: values.description,
        declared_description: values.declared_description?.trim() || undefined,
        applied_date: format(values.applied_date, "yyyy-MM-dd"),
        remaining_percentage: values.remaining_percentage ?? null,
        maintenance_provider_id: values.maintenance_provider_id || undefined,
        intervals: values.intervals,
      },
    });

    resetAndClose();
  };

  const isPending =
    addMaintenanceControlItem.isPending;

  const triggerLabel = itemType === "CERTIFICATE" ? "certificado" : "servicio";

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
              <span className="sr-only">Añadir {triggerLabel}</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Añadir {triggerLabel} a {sectionLabel}</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Añadir {itemType === "CERTIFICATE" ? "Certificado" : "Servicio"}
          </DialogTitle>
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
                    <Input
                      placeholder="EJ: Certificado de Aeronavegabilidad"
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
              <FormItem className="w-full space-y-2">
                <FormLabel className={labelClass}>
                  Realizado Por {itemType === "SERVICE" ? "" : "(Opcional)"}
                </FormLabel>
                <ProviderSelect
                  control={control as Control<any>}
                  name="maintenance_provider_id"
                />
              </FormItem>
            </div>

            <FormField
              control={control}
              name="remaining_percentage"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    % Alerta <span className="text-muted-foreground text-xs">(Opcional, hereda el del control)</span>
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
              {isPending ? (
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
