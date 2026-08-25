"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceProviders } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceProviders";
import { useGetWorkOrdersByAircraft } from "@/hooks/mantenimiento/planificacion/useGetWorkOrdersByAircraft";
import { useCreateMaintenanceCompliance } from "@/actions/mantenimiento/planificacion/cumplimientos/actions";

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
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Cumplimiento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: es }) : <span>Seleccione...</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas de la Aeronave/Parte</FormLabel>
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
                  <FormItem>
                    <FormLabel>Ciclos de la Aeronave/Parte</FormLabel>
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
                <FormItem>
                  <FormLabel>Realizado Por</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingProviders ? "Cargando..." : "Seleccione..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers?.map((provider) => (
                        <SelectItem key={provider.id} value={String(provider.id)}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden de Trabajo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingWorkOrders
                              ? "Cargando..."
                              : workOrders?.length
                                ? "Seleccione..."
                                : "Esta aeronave no tiene Órdenes de Trabajo"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workOrders?.map((wo) => (
                        <SelectItem key={wo.id} value={String(wo.id)}>
                          <span className="flex items-center gap-2">
                            {wo.order_number}
                            <Badge variant="outline" className="text-[10px]">{wo.status}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observaciones <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="bg-primary text-white hover:bg-blue-900 disabled:bg-primary/70"
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
