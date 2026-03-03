"use client";

import {
  useUpdateWorkOrder,
  useUpdateWorkOrderTask,
  useAddWorkOrderTask,
  useDeleteWorkOrderTask,
} from "@/actions/mantenimiento/planificacion/ordenes_trabajo/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { WorkOrder } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Loader2,
  MinusCircle,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ─── Schema de validación ────────────────────────────────────────────────────
const editWorkOrderSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  elaborated_by: z.string().min(1, "Campo obligatorio"),
  reviewed_by: z.string().min(1, "Campo obligatorio"),
  approved_by: z.string().min(1, "Campo obligatorio"),
  date: z.date({ required_error: "La fecha es obligatoria" }),
});

type EditWorkOrderFormValues = z.infer<typeof editWorkOrderSchema>;

// ─── Tipo interno para las tareas editables ──────────────────────────────────
interface EditableTask {
  id?: number;       // id real si ya existe en BD
  tempId: string;    // id temporal para UI
  description_task: string;
  ata: string;
  material: string;
  isNew: boolean;    // true = tarea nueva (a insertar); false = tarea existente (a actualizar)
  isDirty: boolean;  // true = fue modificada
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface EditWorkOrderFormProps {
  work_order: WorkOrder;
  onClose: () => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────
const EditWorkOrderForm = ({ work_order, onClose }: EditWorkOrderFormProps) => {
  const { selectedCompany } = useCompanyStore();

  const { updateWorkOrder } = useUpdateWorkOrder();
  const { updateWorkOrderTask } = useUpdateWorkOrderTask();
  const { addWorkOrderTask } = useAddWorkOrderTask();
  const { deleteWorkOrderTask } = useDeleteWorkOrderTask();

  const isClosed = work_order.status === "CERRADO";

  // ─── Estado local de tareas ─────────────────────────────────────────────
  const [tasks, setTasks] = useState<EditableTask[]>(() =>
    (work_order.work_order_tasks ?? []).map((t) => ({
      id: t.id,
      tempId: crypto.randomUUID(),
      description_task: t.description_task ?? "",
      ata: t.ata ?? "",
      material: (t as any).material ?? "",
      isNew: false,
      isDirty: false,
    }))
  );

  // ─── Estado para el AlertDialog de confirmación de borrado ───────────────
  const [taskToDelete, setTaskToDelete] = useState<EditableTask | null>(null);

  // ─── Form con valores pre-llenados ──────────────────────────────────────
  const form = useForm<EditWorkOrderFormValues>({
    resolver: zodResolver(editWorkOrderSchema),
    defaultValues: {
      description: work_order.description ?? "",
      elaborated_by: work_order.elaborated_by ?? "",
      reviewed_by: work_order.reviewed_by ?? "",
      approved_by: work_order.approved_by ?? "",
      date: work_order.date ? parseISO(work_order.date) : new Date(),
    },
  });

  // ─── Agregar tarea vacía ─────────────────────────────────────────────────
  const addEmptyTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        description_task: "",
        ata: "",
        material: "",
        isNew: true,
        isDirty: true,
      },
    ]);
  };

  // ─── Actualizar campo de una tarea ───────────────────────────────────────
  const updateTaskField = (tempId: string, field: keyof EditableTask, value: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.tempId === tempId ? { ...t, [field]: value, isDirty: true } : t
      )
    );
  };

  // ─── Eliminar tarea (abre confirmación) ──────────────────────────────────
  const requestDeleteTask = (task: EditableTask) => {
    if (task.isNew) {
      // Tarea nueva (aún no en BD): se quita directamente de la UI
      setTasks((prev) => prev.filter((t) => t.tempId !== task.tempId));
    } else {
      // Tarea existente: pedir confirmación antes de llamar al backend
      setTaskToDelete(task);
    }
  };

  // ─── Confirmar eliminación de tarea existente ────────────────────────────
  const confirmDeleteTask = async () => {
    if (!taskToDelete || !taskToDelete.id || !selectedCompany) return;
    try {
      await deleteWorkOrderTask.mutateAsync({
        id: taskToDelete.id,
        company: selectedCompany.slug,
      });
      // Quitarla del estado local también
      setTasks((prev) => prev.filter((t) => t.tempId !== taskToDelete.tempId));
    } catch (error) {
      console.error("[EditWorkOrderForm] Error al eliminar tarea:", error);
    } finally {
      setTaskToDelete(null);
    }
  };

  // ─── Submit principal ────────────────────────────────────────────────────
  const onSubmit = async (data: EditWorkOrderFormValues) => {
    if (!selectedCompany) return;

    if (isClosed) {
      toast.error("Orden cerrada", {
        description: "No se puede editar una orden de trabajo con estado CERRADO.",
      });
      return;
    }

    const company = selectedCompany.slug;
    const orderId = work_order.id;

    try {
      // 1. Actualizar campos principales de la orden
      await updateWorkOrder.mutateAsync({
        id: orderId,
        company,
        data: {
          description: data.description,
          elaborated_by: data.elaborated_by,
          reviewed_by: data.reviewed_by,
          approved_by: data.approved_by,
          date: format(data.date, "yyyy-MM-dd"),
        },
      });

      // 2. Procesar tareas en paralelo
      const taskPromises: Promise<any>[] = [];

      tasks.forEach((task) => {
        if (task.isNew && task.isDirty) {
          if (!task.description_task || !task.ata) return; // omitir si está vacía
          taskPromises.push(
            addWorkOrderTask.mutateAsync({
              work_order_id: orderId,
              company,
              data: {
                description_task: task.description_task,
                ata: task.ata,
                material: task.material || null,
                task_items: [],
              },
            })
          );
        } else if (!task.isNew && task.isDirty && task.id) {
          taskPromises.push(
            updateWorkOrderTask.mutateAsync({
              id: task.id,
              company,
              data: {
                description_task: task.description_task,
                ata: task.ata,
                material: task.material || null,
              },
            })
          );
        }
      });

      await Promise.all(taskPromises);
      onClose();
    } catch (error) {
      console.error("[EditWorkOrderForm] Error al guardar:", error);
    }
  };

  const isPending =
    updateWorkOrder.isPending ||
    updateWorkOrderTask.isPending ||
    addWorkOrderTask.isPending;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* AlertDialog de confirmación para eliminar tarea existente */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => { if (!open) setTaskToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es <strong>irreversible</strong>. Se eliminarán la tarea y todos sus
              ítems asociados de la orden de trabajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWorkOrderTask.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              disabled={deleteWorkOrderTask.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteWorkOrderTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Encabezado con info estática */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-muted/40 rounded-lg p-3 border">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Número de Orden</p>
            <p className="font-bold text-sm">{work_order.order_number}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Aeronave</p>
            <p className="font-bold text-sm">{work_order.aircraft?.acronym ?? "N/A"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge
              className={
                work_order.status === "ABIERTO"
                  ? "bg-green-500 text-white pointer-events-none"
                  : work_order.status === "CERRADO"
                  ? "bg-red-500 text-white pointer-events-none"
                  : "bg-gray-400 text-white pointer-events-none"
              }
            >
              {work_order.status}
            </Badge>
          </div>
        </div>

        {isClosed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
            ⚠️ Esta orden de trabajo está <strong>CERRADA</strong> y no puede ser modificada.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Campos principales ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                        placeholder="Describa la orden de trabajo..."
                        disabled={isClosed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3 mt-1.5">
                    <FormLabel>Fecha de Orden</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isClosed}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP", { locale: es })
                              : <span>Seleccione una fecha...</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={es}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="elaborated_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elaborado Por</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="disabled:opacity-65" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewed_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisado Por</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="disabled:opacity-65" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approved_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aprobado Por</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="disabled:opacity-65" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* ── Tareas ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tareas de la Orden</h2>
                {!isClosed && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmptyTask}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar Tarea
                  </Button>
                )}
              </div>

              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay tareas registradas en esta orden.
                </p>
              )}

              <ScrollArea className={cn("flex", tasks.length > 2 ? "h-[380px]" : "")}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-2">
                  {tasks.map((task, index) => (
                    <div
                      key={task.tempId}
                      className={cn(
                        "p-4 border rounded-lg",
                        task.isNew && "border-dashed border-blue-400 bg-blue-50/30 dark:bg-blue-950/20",
                        task.isDirty && !task.isNew && "border-amber-400/60"
                      )}
                    >
                      {/* Encabezado de la tarea */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {task.isNew ? "✦ Nueva tarea" : `Tarea ${index + 1}`}
                          </span>
                          {task.isDirty && !task.isNew && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              (modificada)
                            </span>
                          )}
                        </div>

                        {/* Botón eliminar — disponible para nuevas Y existentes */}
                        {!isClosed && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => requestDeleteTask(task)}
                            disabled={deleteWorkOrderTask.isPending}
                            className="h-7 w-7 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title={task.isNew ? "Quitar tarea" : "Eliminar tarea de la orden"}
                          >
                            {task.isNew
                              ? <MinusCircle className="h-4 w-4" />
                              : <Trash2 className="h-4 w-4" />
                            }
                          </Button>
                        )}
                      </div>

                      {/* Campos de la tarea */}
                      <div className="space-y-3">
                        <FormItem>
                          <FormLabel className="text-xs">Código ATA</FormLabel>
                          <Input
                            value={task.ata}
                            onChange={(e) => updateTaskField(task.tempId, "ata", e.target.value)}
                            placeholder="Ej: 25"
                            disabled={isClosed}
                            className="h-8 text-sm"
                          />
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">Descripción de la Tarea</FormLabel>
                          <Textarea
                            value={task.description_task}
                            onChange={(e) =>
                              updateTaskField(task.tempId, "description_task", e.target.value)
                            }
                            placeholder="Describa la tarea..."
                            disabled={isClosed}
                            rows={2}
                            className="text-sm"
                          />
                        </FormItem>

                        <FormItem>
                          <FormLabel className="text-xs">Material</FormLabel>
                          <Textarea
                            value={task.material}
                            onChange={(e) =>
                              updateTaskField(task.tempId, "material", e.target.value)
                            }
                            placeholder="Materiales requeridos..."
                            disabled={isClosed}
                            rows={2}
                            className="text-sm"
                          />
                        </FormItem>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* ── Botones de acción ── */}
            {!isClosed && (
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            )}

            {isClosed && (
              <div className="flex justify-end pt-2 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </>
  );
};

export default EditWorkOrderForm;
