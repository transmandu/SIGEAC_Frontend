"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useGetWorkOrdersByAircraft } from "@/hooks/mantenimiento/planificacion/useGetWorkOrdersByAircraft";
import { useCreateMaintenanceCompliance } from "@/actions/mantenimiento/planificacion/cumplimientos/actions";
import {
  SearchableSelect,
  fieldClass,
  labelClass,
} from "@/components/forms/mantenimiento/planificacion/_theme";

const formSchema = z.object({
  compliance_date: z.date({ required_error: "Seleccione una fecha" }),
  hours_reading: z.coerce.number().min(0, "Debe ser ≥ 0"),
  cycles_reading: z.coerce.number().min(0, "Debe ser ≥ 0"),
  maintenance_provider_id: z.string().min(1, "Seleccione quién lo realizó"),
  work_order_id: z.string().min(1, "Seleccione la Orden de Trabajo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Texto normal restringido a dígitos y un punto decimal, sin las flechitas
// nativas de type="number".
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

interface RegisterComplianceDialogProps {
  itemId: number;
  itemName: string;
  aircraftId: number | string;
  defaultHours?: number;
  defaultCycles?: number;
}

export function RegisterComplianceDialog({
  itemId,
  itemName,
  aircraftId,
  defaultHours,
  defaultCycles,
}: RegisterComplianceDialogProps) {
  const [open, setOpen] = useState(false);
  const { selectedCompany } = useCompanyStore();
  const { data: providers, isLoading: isLoadingProviders } = useGetMaintenanceProviders(selectedCompany?.slug);
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useGetWorkOrdersByAircraft(selectedCompany?.slug, aircraftId);
  const { createMaintenanceCompliance } = useCreateMaintenanceCompliance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      compliance_date: new Date(),
      hours_reading: defaultHours ?? (undefined as unknown as number),
      cycles_reading: defaultCycles ?? (undefined as unknown as number),
      maintenance_provider_id: "",
      work_order_id: "",
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createMaintenanceCompliance.mutateAsync({
      company: selectedCompany!.slug,
      data: {
        maintenance_control_item_id: itemId,
        maintenance_provider_id: values.maintenance_provider_id,
        work_order_id: values.work_order_id,
        compliance_date: format(values.compliance_date, "yyyy-MM-dd"),
        hours_reading: values.hours_reading,
        cycles_reading: values.cycles_reading,
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

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar Cumplimiento</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="compliance_date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <DatePickerField
                    label="Fecha de Cumplimiento"
                    value={field.value}
                    setValue={(date) => field.onChange(date ?? undefined)}
                    required
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours_reading"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className={labelClass}>Horas de la Aeronave/Parte</FormLabel>
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
                    <FormLabel className={labelClass}>Ciclos de la Aeronave/Parte</FormLabel>
                    <FormControl>
                      <NumericField field={field} placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormLabel className={labelClass}>Orden de Trabajo</FormLabel>
                  <SearchableSelect
                    options={(workOrders ?? []).map((wo) => ({ ...wo, name: wo.order_number }))}
                    value={field.value}
                    loading={isLoadingWorkOrders}
                    placeholder={
                      workOrders?.length ? "Seleccione..." : "Esta aeronave no tiene Órdenes de Trabajo"
                    }
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
              disabled={createMaintenanceCompliance.isPending}
              type="submit"
            >
              {createMaintenanceCompliance.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <p>Registrar Cumplimiento</p>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
