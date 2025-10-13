"use client";
import { useUpdateNoRoutineTask } from "@/actions/mantenimiento/planificacion/ordenes_trabajo/no_rutinarios/actions";
import {
  useCreateTaskEvents,
  useUpdateWorkOrderTask,
  useUpdateWorkOrderTaskStatus,
} from "@/actions/mantenimiento/planificacion/ordenes_trabajo/rutinarios/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAutoScheduleGenerator } from "@/hooks/mantenimiento/planificacion/useGenerateSchedule";
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees";
import { useCompanyStore } from "@/stores/CompanyStore";
import { WorkOrder } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, Loader2, Pencil, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CreateNoRutineDialog from "./CreateNoRutineDialog";


const assignmentFormSchema = z.object({
  technician_responsable: z.string().min(1, "Debe seleccionar un técnico"),
  inspector_responsable: z.string().optional(),
  scheduling: z.object({
    startDate: z.date(),
    totalHours: z.number().min(1, "Mínimo 1 hora"),
    hoursPerDay: z.number().min(1, "Mínimo 1 hora por día"),
    events: z
      .array(
        z.object({
          title: z.string(),
          start: z.string(),
          end: z.string(),
          description: z.string(),
        })
      )
      .optional(),
  }),
});

type TaskDetailsDialogProps = {
  selectedTask: WorkOrder["work_order_tasks"][0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isNonRoutine?: boolean;
  mainTask?: WorkOrder["work_order_tasks"][0];
};

export const TaskDetailsDialog = ({
  selectedTask,
  open,
  onOpenChange,
  isNonRoutine = false,
  mainTask,
}: TaskDetailsDialogProps) => {
  const [currentStep, setCurrentStep] = useState<"assign" | "schedule">(
    "assign"
  );
  const [isEditing, setIsEditing] = useState(false);

  const { updateWorkOrderTask } = useUpdateWorkOrderTask();
  const { updateNoRoutineTask } = useUpdateNoRoutineTask();
  const { updateTaskStatus } = useUpdateWorkOrderTaskStatus();
  const { createTaskEvents } = useCreateTaskEvents();
  const { selectedCompany, selectedStation } = useCompanyStore();
  const { data: technicians, isLoading: isTechniciansLoading } =
    useGetWorkOrderEmployees({
      company: selectedCompany?.slug,
      location_id: selectedStation!,
      acronym: 'MANP'
    });

  const form = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      technician_responsable: selectedTask?.technician_responsable || "",
      inspector_responsable: selectedTask?.inspector_responsable || "",
      scheduling: {
        startDate: new Date(),
        totalHours: 8,
        hoursPerDay: 4,
        events: []
      },
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const scheduling = watch("scheduling");

  // Hook que genera la programación automáticamente
  useAutoScheduleGenerator(scheduling, selectedTask, setValue);

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    try {
      if (isNonRoutine) {
        await updateNoRoutineTask.mutateAsync({
          data: { id: selectedTask.id.toString(), status: "CERRADO" },
          company: selectedCompany!.slug,
        });
      } else {
        await updateTaskStatus.mutateAsync({
          task_id: selectedTask.id.toString(),
          status: "CERRADO",
          company: selectedCompany!.slug,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error al cerrar la tarea:", error);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedTask) return;
    try {
      if (scheduling.events?.length) {
        await createTaskEvents.mutateAsync({
          data: scheduling.events,
          task_id: selectedTask.id.toString(),
        });
      }
    } catch (error) {
      console.error("Error al crear eventos de la tarea:", error);
    } finally {
      onOpenChange(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof assignmentFormSchema>) => {
    const { scheduling, ...data } = values;
    const updateTaskData = {
      technician_responsable: data.technician_responsable,
      inspector_responsable: data.inspector_responsable,
      total_hours: scheduling.totalHours.toString(),
    };

    if (!selectedTask) return;
    try {
      if (isNonRoutine) {
        await updateNoRoutineTask.mutateAsync({
          data: {
            id: selectedTask.id.toString(),
            ...updateTaskData,
          },
          company: selectedCompany!.slug,
        });
      } else {
        await updateWorkOrderTask.mutateAsync({
          data: {
            id: selectedTask.id.toString(),
            ...updateTaskData,
          },
          company: selectedCompany!.slug,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    } finally {
      if(!selectedTask.task_events) {
        setCurrentStep("schedule")
      } else {
        onOpenChange(false);
      }
    }
  };


  useEffect(() => {
    if (selectedTask) {
      form.reset({
        technician_responsable: selectedTask.technician_responsable || "",
        inspector_responsable: selectedTask.inspector_responsable || "",
        scheduling: {
          startDate: new Date(),
          totalHours: 8,
          hoursPerDay: 4,
          events: [],
        },
      });
      setIsEditing(false);
      setCurrentStep("assign");
    }
  }, [selectedTask, form]);

  if (!selectedTask) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-full">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isNonRoutine
              ? `Detalles No Rutinaria - ${mainTask?.task_number}`
              : "Detalles Tarea"}
            {selectedTask?.task_number && `: ${selectedTask.task_number}`}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep === "assign"
              ? "Asignación de responsables"
              : "Programación de la tarea"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Indicador de pasos */}
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={currentStep === "assign" ? "default" : "outline"}
                onClick={() => setCurrentStep("assign")}
                className="flex-1"
              >
                Asignación
              </Button>
              <Button
                type="button"
                variant={currentStep === "schedule" ? "default" : "outline"}
                onClick={() => setCurrentStep("schedule")}
                className="flex-1"
              >
                Programación
              </Button>
            </div>
            {currentStep === "assign" && (
              <div className="space-y-4 w-full">
                {/* Información básica de la tarea */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-content-center">
                  <div>
                    <h3 className="font-medium">Descripción</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.description_task}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Manual de Origen</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.origin_manual}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Código ATA</h3>
                    <p className="text-sm text-muted-foreground">
                      {mainTask ? mainTask.ata : selectedTask.ata}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Estado</h3>
                    <div className="flex gap-2">
                      <Badge
                        className={
                          selectedTask.status === "ABIERTO"
                            ? "cursor-pointer"
                            : "bg-red-500 hover:bg-red-600 cursor-pointer"
                        }
                      >
                        {selectedTask.status}
                      </Badge>
                      {selectedTask.non_routine && (
                        <Badge
                          className={
                            selectedTask.non_routine.status === "ABIERTO"
                              ? "bg-yellow-500"
                              : ""
                          }
                        >
                          No Rutinaria - {selectedTask.non_routine.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección de responsables */}
                {isEditing ||
                (!selectedTask.technician_responsable &&
                  !selectedTask.inspector_responsable) ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="technician_responsable"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Técnico Responsable</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isTechniciansLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un técnico" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isTechniciansLoading ? (
                                  <div className="flex justify-center py-2">
                                    <Loader2 className="animate-spin h-4 w-4" />
                                  </div>
                                ) : (
                                  technicians?.map((tech) => (
                                    <SelectItem key={tech.dni} value={tech.dni}>
                                      {tech.first_name} {tech.last_name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="inspector_responsable"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Inspector Responsable</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingrese inspector..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        type="submit"
                        disabled={
                          updateWorkOrderTask.isPending ||
                          updateNoRoutineTask.isPending
                        }
                        className="flex-1"
                      >
                        {updateWorkOrderTask.isPending ? (
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : null}
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Técnico responsable */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Técnico Responsable</h3>
                        {selectedTask.status === "ABIERTO" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                            <User2 className="h-4 w-4" />
                            <span>{selectedTask.technician_responsable}</span>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <h4 className="font-medium mb-2">
                            Técnicos anteriores
                          </h4>
                          {selectedTask.old_technician?.length ? (
                            <ul className="space-y-1">
                              {selectedTask.old_technician.map(
                                (tech, index) => (
                                  <li key={index} className="text-sm">
                                    {tech}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No hay técnicos anteriores
                            </p>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Inspector responsable */}
                    <div className="space-y-2">
                      <h3 className="font-medium">Inspector Responsable</h3>
                      <div className="flex items-center gap-2 p-2">
                        <User2 className="h-4 w-4" />
                        <span>
                          {selectedTask.inspector_responsable || "No asignado"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de artículos/partes */}
                {selectedTask.task_items.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Artículos Requeridos</h3>
                    <ScrollArea
                      className={
                        selectedTask.task_items.length > 3 ? "h-[200px]" : ""
                      }
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N° Parte</TableHead>
                            <TableHead>Alterno</TableHead>
                            <TableHead>Serial</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTask.task_items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.article_part_number}</TableCell>
                              <TableCell>
                                {item.article_alt_part_number || "-"}
                              </TableCell>
                              <TableCell>
                                {item.article_serial || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
            {currentStep === "schedule" && (
              <div className="space-y-4">
                {
                  selectedTask.task_events && selectedTask.task_events.length > 0 ? (
                    <div className="space-y-2 flex space-x-4">
                      {selectedTask.task_events.map((event) => {
                        const startDate = new Date(event.start)
                        const endDate  = new Date(event.end)
                        console.log(event.id, startDate, endDate)
                        return (
                          <div
                          key={event.id}
                          className="flex items-start gap-4 rounded-lg border p-3 hover:bg-muted transition"
                          >
                            {/* Fecha y hora */}
                            <div className="text-xs text-muted-foreground w-28 flex-shrink-0">
                              {`${format(startDate, "d 'de' MMMM 'de' yyyy, H:mm", { locale: es })} – ${format(endDate, "d 'de' MMMM 'de' yyyy, H:mm", { locale: es })}`}
                            </div>

                            {/* Contenido */}
                            <div className="flex flex-col">
                              <div className="font-medium text-sm">{event.title}</div>
                              {event.description && (
                                <div className="text-xs text-muted-foreground">{event.description}</div>
                              )}
                            </div>
                          </div>
                        )

                        }
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2 flex space-x-4">
                        <div>
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <Calendar
                            mode="single"
                            selected={scheduling?.startDate}
                            onSelect={(date) =>
                              date && setValue("scheduling.startDate", date)
                            }
                            className="rounded-md border w-full"
                          />
                        </div>
                        <div className="space-y-3 w-full">
                          <div className="space-y-2">
                            <FormLabel>Horas Totales</FormLabel>
                            <Input
                              type="number"
                              min="1"
                              value={scheduling?.totalHours || 0}
                              onChange={(e) =>
                                setValue(
                                  "scheduling.totalHours",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <FormLabel>Horas por Día</FormLabel>
                            <Input
                              type="number"
                              min="1"
                              value={scheduling?.hoursPerDay || 0}
                              onChange={(e) =>
                                setValue(
                                  "scheduling.hoursPerDay",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          {scheduling?.events?.length ? (
                            <div className="space-y-2">
                              {scheduling?.events?.length ? (
                                <div className="space-y-2">
                                  <FormLabel className="p-2">
                                    Eventos Programados
                                  </FormLabel>
                                  <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                                    {scheduling.events.map((event, index) => (
                                      <div key={index} className="p-3">
                                        <div className="font-medium">
                                          {event.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {format(event.start, "PPP", { locale: es })}{" "}
                                          - {format(event.start, "p")} a{" "}
                                          {format(event.end, "p")}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                "No hay eventos programados."
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                }

              </div>
            )}
            <DialogFooter className="sm:justify-between mt-5">
              {currentStep === "assign" ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                  {selectedTask.status === "ABIERTO" &&
                    selectedTask.technician_responsable &&
                    !isEditing && (
                      <div className="flex gap-2 items-center">
                        {!selectedTask.non_routine && !isNonRoutine && (
                          <CreateNoRutineDialog
                            task_id={selectedTask.id.toString()}
                          />
                        )}
                        <Button
                          onClick={handleCompleteTask}
                          disabled={
                            updateTaskStatus.isPending ||
                            selectedTask.non_routine?.status === "ABIERTO" ||
                            updateNoRoutineTask.isPending
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updateTaskStatus.isPending && (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          )}
                          Confirmar Cierre
                        </Button>
                      </div>
                    )}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("assign")}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Volver a asignación
                  </Button>
                  {
                   selectedTask.task_events && selectedTask.task_events.length < 1 && (
                      <Button disabled={createTaskEvents.isPending} onClick={handleScheduleSubmit} type="button">
                        {createTaskEvents.isPending ? <Loader2 className="animate-spin" /> : "Crear Eventos"}
                      </Button>
                    )
                  }
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
