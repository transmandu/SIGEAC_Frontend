"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarPlus, Loader2 } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fieldClass,
  labelClass,
  SectionTitle,
  selectTriggerClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { cn } from "@/lib/utils";
import { useGetCalendarEventTypes } from "@/hooks/general/calendario/useGetCalendarEventTypes";
import { useCreateCalendarEvent, useUpdateCalendarEvent, ManualCalendarEventData } from "@/actions/general/calendario/actions";
import { ManualCalendarEvent } from "@/types";

const formSchema = z
  .object({
    calendar_event_type_id: z.string().optional(),
    title: z.string().min(1, "Ingrese un título"),
    description: z.string().optional(),
    all_day: z.boolean(),
    start_at: z.string().min(1, "Seleccione cuándo empieza"),
    end_at: z.string().min(1, "Seleccione cuándo termina"),
  })
  .refine(
    // Todo el día permite un evento de un solo día (mismo start y end); con
    // hora, en cambio, tiene que haber un intervalo real.
    (vals) => (vals.all_day ? new Date(vals.end_at) >= new Date(vals.start_at) : new Date(vals.end_at) > new Date(vals.start_at)),
    { message: "Debe terminar después de que empieza", path: ["end_at"] },
  );

type FormValues = z.infer<typeof formSchema>;

const toDateTimeInputValue = (isoDate: string) => format(new Date(isoDate), "yyyy-MM-dd'T'HH:mm");
const toDateInputValue = (isoDate: string) => format(new Date(isoDate), "yyyy-MM-dd");

interface ManualEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: string;
  event?: ManualCalendarEvent;
}

export function ManualEventDialog({ open, onOpenChange, company, event }: ManualEventDialogProps) {
  const { data: eventTypes = [] } = useGetCalendarEventTypes(company);
  const { createCalendarEvent } = useCreateCalendarEvent();
  const { updateCalendarEvent } = useUpdateCalendarEvent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { calendar_event_type_id: "", title: "", description: "", all_day: false, start_at: "", end_at: "" },
  });

  const allDay = form.watch("all_day");

  useEffect(() => {
    if (!open) return;
    const isAllDay = event?.all_day ?? false;
    const formatValue = isAllDay ? toDateInputValue : toDateTimeInputValue;
    form.reset({
      calendar_event_type_id: event?.calendar_event_type_id ? String(event.calendar_event_type_id) : "",
      title: event?.title ?? "",
      description: event?.description ?? "",
      all_day: isAllDay,
      start_at: event ? formatValue(event.start_at) : "",
      end_at: event ? formatValue(event.end_at) : "",
    });
  }, [open, event, form]);

  // Al cambiar el tipo de campo (fecha vs fecha+hora), el valor que ya
  // estaba escrito queda con el formato viejo y el input lo rechaza en
  // silencio — se reconvierte para que no se pierda lo que el usuario ya puso.
  const handleAllDayChange = (checked: boolean) => {
    form.setValue("all_day", checked);
    const start = form.getValues("start_at");
    const end = form.getValues("end_at");
    if (!start && !end) return;

    if (checked) {
      if (start) form.setValue("start_at", start.slice(0, 10));
      if (end) form.setValue("end_at", end.slice(0, 10));
    } else {
      if (start) form.setValue("start_at", `${start.slice(0, 10)}T00:00`);
      if (end) form.setValue("end_at", `${end.slice(0, 10)}T23:59`);
    }
  };

  const isPending = createCalendarEvent.isPending || updateCalendarEvent.isPending;

  const onSubmit = (values: FormValues) => {
    const data: ManualCalendarEventData = {
      calendar_event_type_id: values.calendar_event_type_id ? Number(values.calendar_event_type_id) : null,
      title: values.title,
      description: values.description || undefined,
      start_at: values.start_at,
      end_at: values.end_at,
      all_day: values.all_day,
    };

    if (event) {
      updateCalendarEvent.mutate({ id: event.id, company, data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCalendarEvent.mutate({ company, data }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md border-slate-400/50 bg-gradient-to-br from-background/95 to-background/90",
          "backdrop-blur-xl dark:border-slate-600/50",
        )}
      >
        <SectionTitle icon={CalendarPlus} title={event ? "Editar Evento Manual" : "Nuevo Evento Manual"} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Auditoría externa" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="calendar_event_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Sin tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="all_day"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2.5 space-y-0 rounded-lg border border-slate-400/40 bg-background/40 px-3.5 py-2.5 dark:border-slate-600/40">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={handleAllDayChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 font-normal">Todo el día</FormLabel>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Empieza</FormLabel>
                    <FormControl>
                      <Input type={allDay ? "date" : "datetime-local"} className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Termina</FormLabel>
                    <FormControl>
                      <Input type={allDay ? "date" : "datetime-local"} className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>
                    Descripción <span className="text-muted-foreground text-xs">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="..." className={textareaClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <ActionTriggerButton type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {event ? "Guardar Cambios" : "Crear"}
              </ActionTriggerButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
