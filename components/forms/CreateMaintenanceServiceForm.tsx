'use client';

import { useCreateMaintenanceService } from "@/actions/planificacion/servicios/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetManufacturers } from "@/hooks/ajustes/globales/condiciones/useGetConditions";
import { useGetBatchesByLocationId } from "@/hooks/useGetBatchesByLocationId";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";

// Esquema de validación para el servicio
const serviceSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 carácteres.",
  }),
  description: z.string().min(1, {
    message: "La descripción del servicio es obligatoria.",
  }),
  type: z.enum(["PART", "AIRCRAFT"], {
    message: "El tipo de servicio es obligatorio.",
  }),
  origin_manual: z.string().optional(),
  manufacturer_id: z.string({
    message: "El fabricante es obligatorio.",
  }),
});

const toolSchema = z.object({
  article_part_number: z.string().min(1, "Número de parte es requerido"),
  article_alt_part_number: z.string().optional(),
  article_serial: z.string().min(1, "Número de serie es requerido"),
});

// Esquema de validación para una tarea
const taskSchema = z.object({
  description: z.string().min(1, {
    message: "La descripción de la tarea es obligatoria.",
  }),
  tools: z.array(toolSchema).min(1, "Debe agregar al menos una herramienta"),
});
// Esquema de validación para el formulario de tareas
const tasksFormSchema = z.object({
  tasks: z.array(taskSchema).min(1, {
    message: "Debe agregar al menos una tarea.",
  }),
});

// Tipo para el servicio
type ServiceFormType = z.infer<typeof serviceSchema>;

// Tipo para las tareas
type TasksFormType = z.infer<typeof tasksFormSchema>;

// Tipo para el objeto final que se enviará al backend
type MaintenanceServicePayload = {
  service: ServiceFormType;
  tasks: TasksFormType["tasks"];
};

interface CreateMaintenanceServiceDialogProps {
  onClose: () => void;
}

export function CreateMaintenanceServiceForm({ onClose }: CreateMaintenanceServiceDialogProps) {
  const { mutate, data: batches, isPending: isBatchesLoading, isError: isBatchesError } = useGetBatchesByLocationId();
  const { data: manufacturers, isLoading: isManufacturersLoading, isError: isManufacturersError } = useGetManufacturers()
  const { selectedStation } = useCompanyStore()
  const { createService } = useCreateMaintenanceService()
  const [currentStep, setCurrentStep] = useState(1); // Paso actual
  const [serviceData, setServiceData] = useState<ServiceFormType | null>(null); // Datos del servicio
  const [tasksData, setTasksData] = useState<TasksFormType>({ tasks: [] }); // Datos de las tareas

  // Formulario para el servicio
  const serviceForm = useForm<ServiceFormType>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      origin_manual: "",
    },
  });

  // Formulario para las tareas
  const tasksForm = useForm<TasksFormType>({
    resolver: zodResolver(tasksFormSchema),
    defaultValues: {
      tasks: [{
        description: "",
        tools: []
      }],
    },
  });

  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control: tasksForm.control,
    name: "tasks",
  });

  const filteredManufacturers = useMemo(() => {
    return manufacturers?.filter(
      (manufacturer) => manufacturer.type === serviceForm.watch("type")
    ) || [];
  }, [manufacturers, serviceForm.watch("type")]);

  useEffect(() => {
    if (selectedStation) {
      mutate(Number(selectedStation))
    }
  }, [selectedStation, mutate])

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Función para agregar una herramienta a una tarea
  const addToolToTask = (taskIndex: number) => {
    const currentTools = tasksForm.getValues(`tasks.${taskIndex}.tools`) || [];
    tasksForm.setValue(`tasks.${taskIndex}.tools`, [
      ...currentTools,
      { article_alt_part_number: "", article_serial: "", article_part_number: "" }
    ]);
  };

  // Función para eliminar una herramienta de una tarea
  const removeToolFromTask = (taskIndex: number, toolIndex: number) => {
    const currentTools = tasksForm.getValues(`tasks.${taskIndex}.tools`) || [];
    const updatedTools = currentTools.filter((_, index) => index !== toolIndex);
    tasksForm.setValue(`tasks.${taskIndex}.tools`, updatedTools);
  };

  // Función para manejar el envío final del formulario
  const handleSubmit = async () => {
    const payload: MaintenanceServicePayload = {
      service: serviceData!, // Datos del servicio
      tasks: tasksData.tasks, // Datos de las tareas
    };
    try {
      await createService.mutateAsync(payload);
    } catch (error) {
      console.log(error)
    } finally {

      onClose()
    }
    // console.log(payload)
  };

  return (
    <div className="space-y-4">
      {/* Paso 1: Información del servicio */}
      {currentStep === 1 && (
        <Form {...serviceForm}>
          <form
            onSubmit={serviceForm.handleSubmit((data) => {
              setServiceData(data); // Guardar datos del servicio
              handleNext(); // Avanzar al siguiente paso
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2 items-center justify-center">
              <FormField
                control={serviceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mantenimiento de motor" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Nombre del servicio.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AIRCRAFT">Aeronave</SelectItem>
                        <SelectItem value="PART">Parte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Indique si es de parte o de aeronave.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="manufacturer_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Fabricante</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isManufacturersLoading || isManufacturersError || !serviceForm.getValues("type")}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between w-full",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {
                              isManufacturersLoading && <Loader2 className="size-4 animate-spin mr-2" />
                            }
                            {field.value
                              ? <p>{manufacturers?.find(
                                (manufacturer) => `${manufacturer.id.toString()}` === field.value
                              )?.name}</p>
                              : "Elige al fabricante..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Busque un fabricante..." />
                          <CommandList>
                            <CommandEmpty className="text-sm p-2 text-center">No se ha encontrado ningún fabricante.</CommandEmpty>
                            <CommandGroup>
                              {filteredManufacturers?.map((manufacturer) => (
                                <CommandItem
                                  value={`${manufacturer.id}`}
                                  key={manufacturer.id}
                                  onSelect={() => {
                                    serviceForm.setValue("manufacturer_id", manufacturer.id.toString())
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${manufacturer.id.toString()}` === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {
                                    <p>{manufacturer.name}</p>
                                  }
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Fabricante del servicio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="origin_manual"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Manual de Origen</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CMM - EMM - AMM" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Manual del cual se rige el servicio.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={serviceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" placeholder="Ej: Revisión completa del motor" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Descripción del servicio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Siguiente</Button>
          </form>
        </Form>
      )}

      {/* Paso 2: Agregar tareas */}
      {currentStep === 2 && (
        <Form {...tasksForm}>
          <form
            onSubmit={tasksForm.handleSubmit((data) => {
              setTasksData(data);
              handleNext();
            })}
            className="space-y-4"
          >
            <ScrollArea className={cn("", taskFields.length > 1 ? "h-[400px]" : "")}>
              <div className="space-y-4">
                {taskFields.map((taskField, taskIndex) => (
                  <div key={taskField.id} className="space-y-4 border p-4 rounded-lg">
                    <FormField
                      control={tasksForm.control}
                      name={`tasks.${taskIndex}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción de la Tarea {taskIndex + 1}:</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Revisar sistema de combustible" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Herramientas requeridas:</FormLabel>
                      <div className="space-y-2">
                        {(tasksForm.watch(`tasks.${taskIndex}.tools`) || []).map((tool, toolIndex) => (
                          <div key={toolIndex}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="hover:text-red-500"
                              onClick={() => removeToolFromTask(taskIndex, toolIndex)}
                            >
                              <MinusCircle className="size-4" />
                            </Button>
                            <div key={toolIndex} className="grid grid-cols-3 gap-2 items-end border p-2 rounded">
                              <FormField
                                control={tasksForm.control}
                                name={`tasks.${taskIndex}.tools.${toolIndex}.article_part_number`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">N° Parte</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Número de parte" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={tasksForm.control}
                                name={`tasks.${taskIndex}.tools.${toolIndex}.article_alt_part_number`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Código Alterno</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Opcional" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={tasksForm.control}
                                name={`tasks.${taskIndex}.tools.${toolIndex}.article_serial`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">N° Serie</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Número de serie" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => addToolToTask(taskIndex)}
                      >
                        <PlusCircle className="size-4 mr-2" />
                        Agregar Herramienta
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTask(taskIndex)}
                    >
                      Eliminar Tarea
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button
              type="button"
              variant="secondary"
              onClick={() => appendTask({ description: "", tools: [] })}
            >
              Agregar Tarea
            </Button>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                Anterior
              </Button>
              <Button type="submit">Siguiente</Button>
            </div>
          </form>
        </Form>
      )}

      {/* Paso 3: Resumen y confirmación */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resumen</h3>
          <div>
            <h4 className="font-medium">Información del Servicio</h4>
            <p><strong>Nombre:</strong> {serviceData?.name}</p>
            <p><strong>Descripción:</strong> {serviceData?.description}</p>
            <p><strong>Fabricante:</strong> {manufacturers?.find((m) => m.id.toString() === serviceData!.manufacturer_id)?.name}</p>
          </div>
          <div>
            <h4 className="font-medium">Tareas</h4>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-col gap-2">
                {tasksData.tasks.map((task, index) => (
                  <div key={index} className="border p-4 rounded-lg text-center">
                    <p><strong>Tarea {index + 1}</strong></p>
                    <p><strong>Descripción:</strong> {task.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack}>
              Anterior
            </Button>
            <Button disabled={createService.isPending} type="button" onClick={handleSubmit}>
              {createService.isPending ? <Loader2 className="animate-spin size-4" /> : "Confirmar y Enviar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
