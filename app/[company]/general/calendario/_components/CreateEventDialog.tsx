"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PencilLine, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fieldClass,
  labelClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { LocalCalendarEvent } from "./types";

const formSchema = z
  .object({
    title: z.string().min(1, "Ingrese un título"),
    description: z.string().optional(),
    all_day: z.boolean(),
    start: z.string().min(1, "Seleccione cuándo empieza"),
    end: z.string().min(1, "Seleccione cuándo termina"),
  })
  // Todo el día permite un evento de un solo día (mismo start y end); con
  // hora, en cambio, tiene que haber un intervalo real. Mismo criterio que
  // ManualEventDialog — sin el caso all_day, un evento de un día quedaba
  // imposible de guardar porque su start y su end son la misma fecha.
  .refine(
    (vals) => (vals.all_day ? new Date(vals.end) >= new Date(vals.start) : new Date(vals.end) > new Date(vals.start)),
    { message: "Debe terminar después de que empieza", path: ["end"] },
  );

type FormValues = z.infer<typeof formSchema>;

const toDateTimeInputValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");
const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Este diálogo solo edita: los eventos no se crean a mano desde acá. */
  event?: LocalCalendarEvent;
  onSave: (event: LocalCalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function CreateEventDialog({ open, onOpenChange, event, onSave, onDelete }: CreateEventDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", all_day: false, start: "", end: "" },
  });

  const allDay = form.watch("all_day");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || !event) return;

    const isAllDay = event.allDay ?? false;
    const formatValue = isAllDay ? toDateInputValue : toDateTimeInputValue;

    form.reset({
      title: event.title,
      description: event.description ?? "",
      all_day: isAllDay,
      start: formatValue(event.start),
      end: formatValue(event.end),
    });
  }, [open, event, form]);

  const onSubmit = (values: FormValues) => {
    if (!event) return;

    // Un input type="date" da "YYYY-MM-DD" a secas: `new Date()` lo lee como
    // MEDIANOCHE UTC, que en Caracas (UTC-4) es el día ANTERIOR. Se le agrega
    // la hora local explícita para que el día quede donde el usuario lo eligió.
    const toDate = (value: string) => new Date(values.all_day ? `${value}T00:00` : value);

    onSave({
      id: event.id,
      title: values.title,
      description: values.description || undefined,
      start: toDate(values.start),
      end: toDate(values.end),
      allDay: values.all_day,
    });
    onOpenChange(false);
  };

  // Al cambiar el tipo de campo (fecha vs fecha+hora), el valor ya escrito
  // queda con el formato viejo y el input lo rechaza en silencio — se
  // reconvierte para no perder lo que el usuario ya tenía.
  const handleAllDayChange = (checked: boolean) => {
    form.setValue("all_day", checked);
    const start = form.getValues("start");
    const end = form.getValues("end");

    if (checked) {
      if (start) form.setValue("start", start.slice(0, 10));
      if (end) form.setValue("end", end.slice(0, 10));
    } else {
      if (start) form.setValue("start", `${start.slice(0, 10)}T00:00`);
      if (end) form.setValue("end", `${end.slice(0, 10)}T23:59`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilLine className="size-5" />
            Editar Evento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Inspección de rutina" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
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
                name="start"
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
                name="end"
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

            <DialogFooter className="gap-2 sm:justify-between">
              {/* Eliminar es irreversible: se confirma antes, igual que en el
                  resto del sistema. */}
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará &quot;{event?.title}&quot; de forma permanente. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        if (event) onDelete(event.id);
                        setConfirmOpen(false);
                        onOpenChange(false);
                      }}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
