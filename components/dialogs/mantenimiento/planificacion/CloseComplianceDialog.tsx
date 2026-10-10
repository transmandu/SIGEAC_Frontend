"use client";

import { format, parseISO, startOfDay } from "date-fns";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";

import {
  ComplianceKind,
  useCloseCompliance,
} from "@/actions/mantenimiento/planificacion/cumplimientos/lifecycle";
import {
  ComplianceStartFields,
  StartFormValues,
  buildStartSchema,
  optionalNumber,
  readingsFor,
  startDefaults,
  toStartPayload,
} from "@/components/forms/mantenimiento/planificacion/ComplianceStartFields";
import { WorkOrderField } from "@/components/forms/mantenimiento/planificacion/WorkOrderField";
import { NumericInput } from "@/components/forms/mantenimiento/planificacion/_shared";
import {
  SearchableSelect,
  fieldClass,
  hintClass,
  labelClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/DatePickerField";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ComponentAction, MaintenanceCountingMethod } from "@/types";

const buildCloseSchema = (units: MaintenanceCountingMethod[]) =>
  z
    .object({
      completed_date: z
        .date({ error: "Seleccione una fecha" })
        .refine((date) => startOfDay(date) <= startOfDay(new Date()), {
          message: "No puede cerrarse con fecha futura",
        }),
      completed_hours: optionalNumber,
      completed_cycles: optionalNumber,
      maintenance_provider_id: z.string().min(1, "Seleccione quién lo realizó"),
      work_order_id: z
        .string()
        .min(1, "Indique la Orden de Trabajo que culmina el cumplimiento"),
      notes: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const { hours, cycles } = readingsFor(units);

      if (hours && values.completed_hours === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Indique las horas al finalizar",
          path: ["completed_hours"],
        });
      }

      if (cycles && values.completed_cycles === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Indique los ciclos al finalizar",
          path: ["completed_cycles"],
        });
      }
    });

type CloseFormValues = z.infer<ReturnType<typeof buildCloseSchema>>;

interface CloseComplianceDialogProps {
  kind: ComplianceKind;
  /** Id del cumplimiento vigente que se cierra. */
  complianceId: number;
  subjectName: string;
  workOrderDescription?: string;
  aircraftId: number | string;
  units: MaintenanceCountingMethod[];
  /** Fecha de inicio del cumplimiento que se cierra (yyyy-MM-dd). */
  appliedDate: string;
  /** Contador actual del conjunto (aeronave o parte). */
  defaultHours?: number;
  defaultCycles?: number;
  /** Proveedor con que se inició; se propone al cerrar y al iniciar el siguiente. */
  currentProviderId?: number | string | null;
  /** OT ya atada al cumplimiento vigente: viene precargada. */
  currentWorkOrder?: { id?: number | string; order_number: string } | null;
  /** Una AD de única vez no admite un siguiente cumplimiento. */
  canStartNext?: boolean;
  defaultAction?: ComponentAction;
  defaultMethod?: string | null;
}

/**
 * Culmina el cumplimiento vigente (paso 1: fecha y lecturas de fin, quién y la
 * OT, obligatoria) y pregunta si se inicia otro (paso 2). Si no se inicia, el
 * ítem queda sin cumplimiento vigente y sin reloj hasta que se inicie uno.
 */
export function CloseComplianceDialog({
  kind,
  complianceId,
  subjectName,
  workOrderDescription,
  aircraftId,
  units,
  appliedDate,
  defaultHours,
  defaultCycles,
  currentProviderId,
  currentWorkOrder,
  canStartNext = true,
  defaultAction,
  defaultMethod,
}: CloseComplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"close" | "next">("close");
  const [startNext, setStartNext] = useState(true);
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading: isLoadingProviders } =
    useGetMaintenanceProviders(selectedCompany?.slug);
  const closeCompliance = useCloseCompliance(kind);
  const { hours, cycles } = readingsFor(units);

  const closeDefaults = (): CloseFormValues => ({
    completed_date: new Date(),
    completed_hours: defaultHours,
    completed_cycles: defaultCycles,
    maintenance_provider_id: currentProviderId ? String(currentProviderId) : "",
    // Ya viene resuelta si el cumplimiento estaba atado a una OT: fue la que se
    // abrió para culminarlo, no tiene sentido hacerla elegir de nuevo.
    work_order_id: currentWorkOrder?.id ? String(currentWorkOrder.id) : "",
    notes: "",
  });

  const closeForm = useForm<CloseFormValues>({
    resolver: zodResolver(buildCloseSchema(units)),
    defaultValues: closeDefaults(),
  });
  const nextForm = useForm<StartFormValues>({
    resolver: zodResolver(buildStartSchema(units)),
    defaultValues: startDefaults({}),
  });

  const reset = () => {
    closeForm.reset(closeDefaults());
    nextForm.reset(startDefaults({}));
    setStep("close");
    setStartNext(true);
  };

  const submit = async (
    closing: CloseFormValues,
    next: StartFormValues | null,
  ) => {
    await closeCompliance.mutateAsync({
      company: selectedCompany!.slug,
      complianceId,
      data: {
        completed_date: format(closing.completed_date, "yyyy-MM-dd"),
        completed_hours: closing.completed_hours ?? null,
        completed_cycles: closing.completed_cycles ?? null,
        work_order_id: closing.work_order_id,
        maintenance_provider_id: closing.maintenance_provider_id,
        notes: closing.notes || undefined,
        next: next ? toStartPayload(kind, next) : undefined,
      },
    });
    reset();
    setOpen(false);
  };

  const confirmClose = (values: CloseFormValues) => {
    if (!canStartNext) return submit(values, null);

    nextForm.reset(
      startDefaults({
        date: values.completed_date,
        hours: values.completed_hours,
        cycles: values.completed_cycles,
        providerId: values.maintenance_provider_id,
        action: defaultAction,
        method: defaultMethod,
      }),
    );
    setStep("next");
  };

  const confirmNext = nextForm.handleSubmit((next) =>
    submit(closeForm.getValues(), next),
  );

  const isPending = closeCompliance.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Al abrir y al cerrar se rearma desde lo vigente: la OT atada y el
        // contador pudieron cambiar desde que se montó el diálogo.
        reset();
        setOpen(value);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <CheckCircle2 className="size-4" />
              <span className="sr-only">Cerrar cumplimiento</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Cerrar cumplimiento actual</TooltipContent>
      </Tooltip>

      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-130">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>
            {step === "close"
              ? "Cerrar Cumplimiento"
              : "Siguiente Cumplimiento"}
          </DialogTitle>
          <DialogDescription>
            {subjectName}
            {step === "close" &&
              ` · vigente desde ${format(parseISO(appliedDate), "dd/MM/yyyy")}`}
          </DialogDescription>
        </DialogHeader>

        {step === "close" ? (
          <Form {...closeForm}>
            <form
              onSubmit={closeForm.handleSubmit(confirmClose)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-1">
                <FormField
                  control={closeForm.control}
                  name="completed_date"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <DatePickerField
                        label="Fecha de Fin"
                        value={field.value}
                        setValue={(date) => field.onChange(date ?? undefined)}
                        maxDate={new Date()}
                        required
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(hours || cycles) && (
                  <div className="grid grid-cols-2 gap-4">
                    {hours && (
                      <FormField
                        control={closeForm.control}
                        name="completed_hours"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className={labelClass}>
                              Horas al finalizar
                            </FormLabel>
                            <FormControl>
                              <NumericInput
                                className={fieldClass}
                                placeholder="0"
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
                    {cycles && (
                      <FormField
                        control={closeForm.control}
                        name="completed_cycles"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className={labelClass}>
                              Ciclos al finalizar
                            </FormLabel>
                            <FormControl>
                              <NumericInput
                                className={fieldClass}
                                placeholder="0"
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
                  </div>
                )}

                <FormField
                  control={closeForm.control}
                  name="maintenance_provider_id"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>
                        Realizado Por
                      </FormLabel>
                      <SearchableSelect
                        options={providers ?? []}
                        value={field.value}
                        loading={isLoadingProviders}
                        placeholder="Seleccione..."
                        searchPlaceholder="Buscar entidad..."
                        emptyLabel="No se encontró ninguna entidad."
                        onSelect={(provider) =>
                          field.onChange(String(provider.id))
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={closeForm.control}
                  name="work_order_id"
                  render={({ field }) => (
                    <WorkOrderField
                      value={field.value}
                      onChange={field.onChange}
                      aircraftId={aircraftId}
                      subject={subjectName}
                      taskDescription={workOrderDescription ?? subjectName}
                      pendingWorkOrder={
                        currentWorkOrder?.id
                          ? {
                              id: currentWorkOrder.id,
                              order_number: currentWorkOrder.order_number,
                            }
                          : null
                      }
                      hint="Obligatoria: un cumplimiento no se cierra sin la Orden de Trabajo que lo culminó."
                      optional={false}
                    />
                  )}
                />

                <FormField
                  control={closeForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>
                        Observaciones{" "}
                        <span className="text-xs text-muted-foreground">
                          (Opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="..."
                          className={cn(fieldClass, "h-auto resize-none py-2")}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="shrink-0 border-t bg-background px-6 py-4">
                <Button
                  className="h-11 w-full gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <p>
                      {canStartNext
                        ? "Confirmar y Continuar"
                        : "Cerrar Cumplimiento"}
                    </p>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...nextForm}>
            <form
              onSubmit={confirmNext}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-1">
                <label className="flex cursor-pointer select-none items-start gap-2 text-sm">
                  <Checkbox
                    checked={startNext}
                    onCheckedChange={(checked) =>
                      setStartNext(checked === true)
                    }
                    className="mt-0.5"
                  />
                  <span>
                    Iniciar un nuevo cumplimiento ahora
                    <span className={cn(hintClass, "block")}>
                      Sin uno vigente el ítem queda sin reloj hasta que se
                      inicie otro.
                    </span>
                  </span>
                </label>

                {startNext && (
                  <ComplianceStartFields
                    control={nextForm.control as unknown as Control<any>}
                    kind={kind}
                    units={units}
                    aircraftId={aircraftId}
                    subject={subjectName}
                    taskDescription={workOrderDescription ?? subjectName}
                  />
                )}
              </div>

              <div className="flex shrink-0 gap-2 border-t bg-background px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2"
                  disabled={isPending}
                  onClick={() => setStep("close")}
                >
                  <ArrowLeft className="size-4" />
                  Atrás
                </Button>

                {startNext ? (
                  <Button
                    className="h-11 flex-1 gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <p>Cerrar e Iniciar el Siguiente</p>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="h-11 flex-1 gap-2 rounded-lg bg-linear-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
                    disabled={isPending}
                    type="button"
                    onClick={() => submit(closeForm.getValues(), null)}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <p>Cerrar sin Iniciar Otro</p>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
