"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { format, startOfDay } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useGetWorkOrdersByAircraft } from "@/hooks/mantenimiento/planificacion/useGetWorkOrdersByAircraft";
import { useCreateComponentCompliance } from "@/actions/mantenimiento/planificacion/control_componentes/actions";
import { COMPONENT_ACTION_LABELS } from "@/lib/componentControlLabels";
import { ComponentAction } from "@/types";
import {
  SearchableSelect,
  fieldClass,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";

const optionalNumeric = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().min(0).optional(),
);

const formSchema = z.object({
  compliance_date: z
    .date({ error: "Seleccione una fecha" })
    .refine((date) => startOfDay(date) <= startOfDay(new Date()), {
      message: "No puede registrarse un cumplimiento con fecha futura",
    }),
  hours_reading: z.coerce.number().min(0, "Debe ser ≥ 0"),
  cycles_reading: z.coerce.number().min(0, "Debe ser ≥ 0"),
  action: z.enum(Object.keys(COMPONENT_ACTION_LABELS) as [string, ...string[]]),
  consumed_hours: optionalNumeric,
  consumed_cycles: optionalNumeric,
  maintenance_provider_id: z.string().min(1, "Seleccione quién lo realizó"),
  work_order_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function NumericField({ field, placeholder }: { field: any; placeholder?: string }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={cn(fieldClass, "flex w-full px-3 text-sm outline-none")}
      value={field.value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) field.onChange(raw);
      }}
      onBlur={field.onBlur}
      name={field.name}
    />
  );
}

interface RegisterComponentComplianceDialogProps {
  itemId: number;
  itemName: string;
  aircraftId: number | string;
  /** Acción que exige el límite del componente; se propone como lo hecho. */
  defaultAction: ComponentAction;
  /** Contador actual del PADRE (aeronave o motor/hélice), no del componente. */
  defaultHours?: number;
  defaultCycles?: number;
  pendingWorkOrder?: { id: number | string; order_number: string } | null;
}

/**
 * Espejo de RegisterComplianceDialog para componentes: las lecturas son las
 * del padre, y además se registra qué se hizo (overhaul/reemplazo dejan el
 * componente en cero; reparación/inspección conservan lo consumido).
 */
export function RegisterComponentComplianceDialog({
  itemId,
  itemName,
  aircraftId,
  defaultAction,
  defaultHours,
  defaultCycles,
  pendingWorkOrder,
}: RegisterComponentComplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading: isLoadingProviders } = useGetMaintenanceProviders(selectedCompany?.slug);
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useGetWorkOrdersByAircraft(selectedCompany?.slug, aircraftId);
  const { createComponentCompliance } = useCreateComponentCompliance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      compliance_date: new Date(),
      hours_reading: defaultHours ?? (undefined as unknown as number),
      cycles_reading: defaultCycles ?? (undefined as unknown as number),
      action: defaultAction,
      consumed_hours: 0,
      consumed_cycles: 0,
      maintenance_provider_id: "",
      work_order_id: pendingWorkOrder ? String(pendingWorkOrder.id) : "",
      notes: "",
    },
  });

  const action = form.watch("action");
  const keepsConsumed = action === "REPAIR" || action === "INSPECTION";

  const onSubmit = async (values: FormValues) => {
    await createComponentCompliance.mutateAsync({
      company: selectedCompany!.slug,
      data: {
        component_control_item_id: itemId,
        maintenance_provider_id: values.maintenance_provider_id,
        work_order_id: values.work_order_id || undefined,
        compliance_date: format(values.compliance_date, "yyyy-MM-dd"),
        hours_reading: values.hours_reading,
        cycles_reading: values.cycles_reading,
        action: values.action as ComponentAction,
        consumed_hours: keepsConsumed ? values.consumed_hours : 0,
        consumed_cycles: keepsConsumed ? values.consumed_cycles : 0,
        notes: values.notes || undefined,
      },
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <CheckCircle2 className="size-4" />
              <span className="sr-only">Registrar cumplimiento</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Registrar cumplimiento</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Registrar Cumplimiento</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="compliance_date"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <DatePickerField
                      label="Fecha"
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
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Trabajo realizado</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours_reading"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Horas del padre</FormLabel>
                    <FormControl>
                      <NumericField field={field} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cycles_reading"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Ciclos del padre</FormLabel>
                    <FormControl>
                      <NumericField field={field} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription className={cn(hintClass, "-mt-2")}>
              Lectura de la aeronave o del motor/hélice del que cuelga en el momento del trabajo — contra ese contador se mide el componente.
            </FormDescription>

            {keepsConsumed && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="consumed_hours"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>Horas que conserva</FormLabel>
                      <FormControl>
                        <NumericField field={field} placeholder="0" />
                      </FormControl>
                      <FormDescription className={hintClass}>Desde su último overhaul; una reparación no lo pone en cero.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consumed_cycles"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClass}>Ciclos que conserva</FormLabel>
                      <FormControl>
                        <NumericField field={field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="maintenance_provider_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>Realizado Por</FormLabel>
                  <SearchableSelect
                    options={providers ?? []}
                    value={field.value}
                    loading={isLoadingProviders}
                    placeholder="Seleccione..."
                    searchPlaceholder="Buscar entidad..."
                    emptyLabel="No se encontró ninguna entidad."
                    onSelect={(provider) => field.onChange(String(provider.id))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_order_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    Orden de Trabajo <span className="text-xs text-muted-foreground">(Opcional)</span>
                  </FormLabel>
                  <SearchableSelect
                    options={(workOrders ?? []).map((wo) => ({ ...wo, name: wo.order_number }))}
                    value={field.value}
                    loading={isLoadingWorkOrders}
                    placeholder={workOrders?.length ? "Seleccione..." : "Esta aeronave no tiene Órdenes de Trabajo"}
                    searchPlaceholder="Buscar orden de trabajo..."
                    emptyLabel="No se encontró ninguna orden de trabajo."
                    onSelect={(wo) => field.onChange(String(wo.id))}
                    renderLabel={(wo) => (
                      <span className="flex items-center gap-2">
                        {wo.order_number}
                        <Badge variant="outline" className="text-[10px]">{wo.status}</Badge>
                      </span>
                    )}
                  />
                  <FormDescription className={hintClass}>
                    Vacío si el trabajo lo hizo un taller externo sin orden propia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className={labelClass}>
                    Observaciones <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." className={cn(fieldClass, "h-auto resize-none py-2")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="h-11 gap-2 rounded-lg bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-500/25 disabled:opacity-70"
              disabled={createComponentCompliance.isPending}
              type="submit"
            >
              {createComponentCompliance.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Registrar Cumplimiento</p>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
