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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, Plus, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  description_task: z.string().min(1, 'La descripción de la tarea es obligatoria'),
  ata: z.string().min(1, 'Código ATA requerido'),
  task_number: z.string().min(1, 'Número de tarea requerido'),
  origin_manual: z.string().min(1, 'Origen manual requerido'),
  task_items: z.array(z.object({
    part_number: z.string().min(1, 'Número de parte requerido'),
    alternate_part_number: z.string().optional(),
  })).optional()
});

export function AddRoutineTaskDialog({work_order_id}: {work_order_id: string}) {
  const [open, setOpen] = useState(false);
  const {addWorkOrderTask} = useAddWorkOrderTask()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ata: "",
      description_task: "",
      origin_manual: "",
      task_number: "",
      task_items: [{ part_number: "", alternate_part_number: "" }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "task_items",
  });

  const scrollAreaHeight = useMemo(() => {
    return fields.length > 2 ? "h-[320px]" : "";
  }, [fields.length]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addWorkOrderTask.mutateAsync({work_order_id: work_order_id, data: {
      ...values,
      status: "ABIERTO",
    }});
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
                name="task_number"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Número de Tarea</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: TASK-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="origin_manual"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Manual de Origen</FormLabel>
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
                  <FormLabel>Código ATA</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description_task"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Descripción de la Tarea</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ej: Inspeccionar el ala derecha..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Artículos/Partes Necesarias</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ part_number: "", alternate_part_number: "" })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Artículo
                </Button>
              </div>

              <ScrollArea className={cn("space-y-3", scrollAreaHeight)}>
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-md bg-muted/50 mb-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <FormField
                        name={`task_items.${index}.part_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Parte*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: 1234-5678" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name={`task_items.${index}.alternate_part_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número Alternativo</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: 9876-5432" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        type="button"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <MinusCircle className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
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
