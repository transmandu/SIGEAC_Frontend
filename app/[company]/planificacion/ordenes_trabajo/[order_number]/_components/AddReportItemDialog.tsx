"use client";

import { useAddWorkOrderTask } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/rutinarios/actions";
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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  ata_code: z.string().min(1, 'La descripción de la tarea es obligatoria'),
  report: z.string().min(1, 'Código ATA requerido'),
  action_taken: z.string().min(5, 'Número de tarea requerido al menos 5 caracteres'),
});

export function AddReportItemDialog({work_order_report_pages_id}: {work_order_report_pages_id: string}) {
  const [open, setOpen] = useState(false);
  const {addWorkOrderTask} = useAddWorkOrderTask()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    form.reset()
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <p className="flex gap-2 items-center text-sm">
            <Plus className="h-4 w-4"/> Añadir Tarea
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Tarea</DialogTitle>
          <DialogDescription>Añada una tarea nueva a una orden de trabajo ya creada.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-2 items-center">
              <FormField
                name="ata_code"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Código ATA</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: TASK-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="report"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Reporte</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: MPD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="ata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acción Efectuada</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ej: 20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
              type="submit"
            >
              Agregar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
