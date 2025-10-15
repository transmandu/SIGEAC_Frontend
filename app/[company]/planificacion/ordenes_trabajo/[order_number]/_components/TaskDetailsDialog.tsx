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
import { ChevronLeft, Loader2, Pencil, User2, PlusCircle, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import CreateNoRutineDialog from "./CreateNoRutineDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


const assignmentFormSchema = z.object({
  technician_responsable: z.string().optional(),
  assigned_technicians: z.array(
    z.object({
      name: z.string().min(1, "Debe seleccionar un técnico"),
      hours: z.number().min(0.5, "Mínimo 0.5 horas").max(24, "Máximo 24 horas"),
    })
  ).min(1, "Debe asignar al menos un técnico"),
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
  const [openTechnicianIndex, setOpenTechnicianIndex] = useState<number | null>(0);

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
      assigned_technicians: selectedTask?.assigned_technicians && selectedTask.assigned_technicians.length > 0 
        ? selectedTask.assigned_technicians 
        : selectedTask?.technician_responsable 
          ? [{ name: selectedTask.technician_responsable, hours: 8 }] 
          : [{ name: "", hours: 8 }],
      inspector_responsable: selectedTask?.inspector_responsable || "",
      scheduling: {
        startDate: new Date(),
        totalHours: 8,
        hoursPerDay: 4,
        events: []
      },
    },
  });

  const { watch, setValue, handleSubmit, control } = form;
  const scheduling = watch("scheduling");
  const assignedTechnicians = watch("assigned_technicians");
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "assigned_technicians",
  });

  // Calcula automáticamente las horas hombre totales
  const totalManHours = useMemo(() => {
    return assignedTechnicians?.reduce((total, tech) => total + (tech.hours || 0), 0) || 0;
  }, [assignedTechnicians]);

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
    const { scheduling, assigned_technicians, ...data } = values;
    
    // Calcular las horas hombre totales
    const calculatedManHours = assigned_technicians.reduce((total, tech) => total + tech.hours, 0);
    
    const updateTaskData = {
      technician_responsable: assigned_technicians[0]?.name || "", // Mantener retrocompatibilidad
      assigned_technicians: assigned_technicians,
      total_man_hours: calculatedManHours,
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
        assigned_technicians: selectedTask?.assigned_technicians && selectedTask.assigned_technicians.length > 0 
          ? selectedTask.assigned_technicians 
          : selectedTask?.technician_responsable 
            ? [{ name: selectedTask.technician_responsable, hours: 8 }] 
            : [{ name: "", hours: 8 }],
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
      setOpenTechnicianIndex(0); // Abrir el primer técnico por defecto
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
              <ScrollArea className="max-h-[60vh] pr-4">
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
                (!selectedTask.assigned_technicians?.length && !selectedTask.technician_responsable &&
                  !selectedTask.inspector_responsable) ? (
                  <div className="flex flex-col gap-4">
                    {/* Técnicos Asignados */}
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Técnicos Asignados
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Agregue los técnicos que trabajarán en esta tarea
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            {totalManHours.toFixed(1)} h/h totales
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="max-h-[300px] px-4 py-3">
                          <div className="space-y-2">
                            {fields.map((field, index) => {
                              const techName = form.watch(`assigned_technicians.${index}.name`);
                              const techHours = form.watch(`assigned_technicians.${index}.hours`);
                              const isOpen = openTechnicianIndex === index;
                              
                              return (
                                <Collapsible 
                                  key={field.id} 
                                  open={isOpen}
                                  onOpenChange={(open) => setOpenTechnicianIndex(open ? index : null)}
                                >
                                  <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-transparent">
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-lg">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                            {index + 1}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium text-sm">
                                              {techName || "Técnico sin asignar"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {techHours} horas de trabajo
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {fields.length > 1 && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                remove(index);
                                                if (openTechnicianIndex === index) {
                                                  setOpenTechnicianIndex(null);
                                                }
                                              }}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {isOpen ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                      </div>
                                    </CollapsibleTrigger>
                                    
                                    <CollapsibleContent>
                                      <div className="px-3 pb-3 pt-1 space-y-3 border-t">
                                        <FormField
                                          control={form.control}
                                          name={`assigned_technicians.${index}.name`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs font-medium">
                                                Seleccionar Técnico
                                              </FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={isTechniciansLoading}
                                              >
                                                <FormControl>
                                                  <SelectTrigger className="h-9">
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
                                                      <SelectItem 
                                                        key={tech.dni} 
                                                        value={`${tech.first_name} ${tech.last_name}`}
                                                      >
                                                        {tech.first_name} {tech.last_name}
                                                      </SelectItem>
                                                    ))
                                                  )}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage className="text-xs" />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`assigned_technicians.${index}.hours`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs font-medium">
                                                Horas de trabajo
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  step="0.5"
                                                  min="0.5"
                                                  max="24"
                                                  className="h-9"
                                                  placeholder="8"
                                                  {...field}
                                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                              </FormControl>
                                              <FormMessage className="text-xs" />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        
                        <div className="px-4 pb-3 pt-2 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed"
                            onClick={() => {
                              append({ name: "", hours: 8 });
                              setOpenTechnicianIndex(fields.length);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Agregar Técnico
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inspector Responsable */}
                    <FormField
                      control={form.control}
                      name="inspector_responsable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspector Responsable (Opcional)</FormLabel>
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

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
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
                        Confirmar Asignación
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Técnicos Asignados - Vista de solo lectura */}
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Técnicos Asignados
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm font-semibold">
                              {selectedTask.assigned_technicians?.reduce((sum, t) => sum + t.hours, 0).toFixed(1) || 
                               selectedTask.total_man_hours?.toFixed(1) || 
                               '8.0'} h/h totales
                            </Badge>
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
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedTask.assigned_technicians && selectedTask.assigned_technicians.length > 0 ? (
                            selectedTask.assigned_technicians.map((tech, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="flex items-center gap-2">
                                  <User2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{tech.name}</span>
                                </div>
                                <Badge variant="outline" className="font-mono">
                                  {tech.hours} hrs
                                </Badge>
                              </div>
                            ))
                          ) : selectedTask.technician_responsable ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                              <div className="flex items-center gap-2">
                                <User2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{selectedTask.technician_responsable}</span>
                              </div>
                              <Badge variant="outline" className="font-mono">
                                8 hrs
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No hay técnicos asignados
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inspector responsable */}
                    <div className="space-y-2">
                      <h3 className="font-medium">Inspector Responsable</h3>
                      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                        <User2 className="h-4 w-4 text-muted-foreground" />
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
              </ScrollArea>
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
