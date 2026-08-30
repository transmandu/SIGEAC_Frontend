"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Palette } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { fieldClass, labelClass, SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";
import { CalendarEventType } from "@/types";
import { CalendarEventTypeData, useCreateCalendarEventType, useUpdateCalendarEventType } from "@/actions/general/calendario/actions";

const formSchema = z.object({
  label: z.string().min(1, "Ingrese un nombre"),
  color: z.string().min(1, "Seleccione un color"),
  icon: z.string().optional(),
});

interface EventTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: string;
  eventType?: CalendarEventType;
}

export function EventTypeDialog({ open, onOpenChange, company, eventType }: EventTypeDialogProps) {
  const { createCalendarEventType } = useCreateCalendarEventType();
  const { updateCalendarEventType } = useUpdateCalendarEventType();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: "", color: "#6b7280", icon: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      label: eventType?.label ?? "",
      color: eventType?.color ?? "#6b7280",
      icon: eventType?.icon ?? "",
    });
  }, [open, eventType, form]);

  const isPending = createCalendarEventType.isPending || updateCalendarEventType.isPending;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data: CalendarEventTypeData = { label: values.label, color: values.color, icon: values.icon || undefined };

    if (eventType) {
      updateCalendarEventType.mutate({ id: eventType.id, company, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCalendarEventType.mutate({ company, data }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-sm border-slate-400/50 bg-gradient-to-br from-background/95 to-background/90",
          "backdrop-blur-xl dark:border-slate-600/50",
        )}
      >
        <SectionTitle icon={Palette} title={eventType ? "Editar Tipo de Evento" : "Nuevo Tipo de Evento"} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Vencimientos" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type="color" className={cn(fieldClass, "h-11 w-14 p-1")} {...field} />
                      <Input placeholder="#6b7280" className={fieldClass} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <ActionTriggerButton type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {eventType ? "Guardar Cambios" : "Crear"}
              </ActionTriggerButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
