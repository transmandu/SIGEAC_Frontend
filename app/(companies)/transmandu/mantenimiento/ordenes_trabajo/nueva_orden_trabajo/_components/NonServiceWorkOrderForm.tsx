'use client';
import { useCreateWorkOrder } from '@/actions/planificacion/ordenes_trabajo/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetMaintenanceAircrafts } from '@/hooks/planificacion/useGetMaintenanceAircrafts';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const manualWorkOrderSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  elaborated_by: z.string().min(1, 'Elaborado por es obligatorio'),
  approved_by: z.string().min(1, 'Aprobado por es obligatorio'),
  reviewed_by: z.string().min(1, 'Revisado por es obligatorio'),
  location_id: z.string().min(1, 'La ubicación es obligatoria'),
  authorizing: z.string({
    message: "Debe elegir al autorizante."
  }),
  aircraft_id: z.string(),
  date: z.date(),
  work_order_task: z.array(z.object({
    description_task: z.string().min(1, 'La descripción de la tarea es obligatoria'),
    ata: z.string().min(1, 'Código ATA requerido'),
    task_number: z.string().min(1, 'Número de tarea requerido'),
    origin_manual: z.string().min(1, 'Origen manual requerido'),
    task_items: z.array(z.object({
      part_number: z.string().min(1, 'Número de parte requerido'),
      alternate_part_number: z.string().optional(),
      serial: z.string().optional()
    })).optional()
  })).min(1, 'Debe agregar al menos una tarea'),
});

type ManualWorkOrderFormValues = z.infer<typeof manualWorkOrderSchema>;

interface TaskItem {
  part_number: string;
  alternate_part_number: string;
  serial: string;
}

interface TaskInProgress {
  description_task: string;
  ata: string;
  task_number: string;
  origin_manual: string;
  task_items: TaskItem[];
}

const NonServiceWorkOrderForm = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskInProgress[]>([]);
  const { selectedStation } = useCompanyStore();
  const { createWorkOrder } = useCreateWorkOrder()
  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts();
  const router = useRouter();

  const form = useForm<ManualWorkOrderFormValues>({
    resolver: zodResolver(manualWorkOrderSchema),
    defaultValues: {
      elaborated_by: 'Ing. Francisco Montilla',
      reviewed_by: 'José Flores',
      approved_by: "Fátima Dos Ramos",
      description: '',
      aircraft_id: '',
      work_order_task: [],
    },
  });

  useEffect(() => {
    if (selectedStation) {
      form.setValue('location_id', selectedStation);
    }
  }, [selectedStation, form]);

  const addEmptyTask = () => {
    setTasks(prev => [...prev, {
      description_task: '',
      ata: '',
      task_number: '',
      origin_manual: '',
      task_items: []
    }]);
  };

  const updateTask = (index: number, field: keyof TaskInProgress, value: string) => {
    setTasks(prev => prev.map((task, i) =>
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addEmptyTaskItem = (itemIndex: number) => {
    setTasks(prev => prev.map((task, index) =>
      index === itemIndex
        ? { ...task, task_items: [...task.task_items, { part_number: '', alternate_part_number: '', serial: '' }] }
        : task
    ));
  };

  const updateTaskItem = (taskIndex: number, itemIndex: number, field: keyof TaskItem, value: string) => {
    setTasks(prev => prev.map((task, tIndex) =>
      tIndex === taskIndex
        ? {
          ...task,
          task_items: task.task_items.map((item, iIndex) =>
            iIndex === itemIndex ? { ...item, [field]: value } : item
          )
        }
        : task
    ));
  };

  const removeTaskItem = (taskIndex: number, itemIndex: number) => {
    setTasks(prev => prev.map((task, tIndex) =>
      tIndex === taskIndex
        ? {
          ...task,
          task_items: task.task_items.filter((_, iIndex) => iIndex !== itemIndex)
        }
        : task
    ));
  };

  useEffect(() => {
    form.setValue("work_order_task", tasks);
  }, [tasks, form]);

  const onSubmit = async (data: ManualWorkOrderFormValues) => {
    const formattedData = {
      ...data,
      date: format(data.date, "yyyy-MM-dd")
    };
    await createWorkOrder.mutateAsync(formattedData);
    form.reset();
    router.push('/hangar74/planificacion/ordenes_trabajo');
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <h1 className="text-2xl font-bold">Crear Orden de Trabajo</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className='flex gap-6 items-center justify-center w-full'>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-2'>
              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3 mt-1.5">
                    <FormLabel>Aeronave</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isAircraftsLoading || isAircraftsError}
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {
                              isAircraftsLoading && <Loader2 className="size-4 animate-spin mr-2" />
                            }
                            {field.value
                              ? <p>{aircrafts?.find(
                                (aircraft) => `${aircraft.id.toString()}` === field.value
                              )?.acronym}</p>
                              : "Elige la aeronave..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Busque una aeronave..." />
                          <CommandList>
                            <CommandEmpty className="text-xs p-2 text-center">No se ha encontrado ninguna aeronave.</CommandEmpty>
                            <CommandGroup>
                              {aircrafts?.map((aircraft) => (
                                <CommandItem
                                  value={`${aircraft.id}`}
                                  key={aircraft.id}
                                  onSelect={() => {
                                    form.setValue("aircraft_id", aircraft.id.toString());
                                    setSelectedAircraft(aircraft.manufacturer.id.toString());
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      `${aircraft.id.toString()}` === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {
                                    <p>{aircraft.acronym} - {aircraft.manufacturer.name}</p>
                                  }
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Aeronave que recibirá el servicio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorizing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Quién autoriza..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                        <SelectItem value="EXPLOTADOR">Explotador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                       
                    </FormDescription>
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
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha...</span>
                            )}
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha de la orden de trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className='w-full col-span-2'>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} placeholder="Describa la orden de trabajo..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name="elaborated_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elaborado Por:</FormLabel>
                    <FormControl>
                      <Input {...field} disabled defaultValue={"Ing. Francisco Montilla"} className='disabled:opacity-65' />
                    </FormControl>
                    <FormDescription>
                      Quien elabora la orden de trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reviewed_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisado Por:</FormLabel>
                    <FormControl>
                      <Input {...field} disabled defaultValue={"José Flores"} className='disabled:opacity-65' />
                    </FormControl>
                    <FormDescription>
                      Quien revisa la orden de trabajo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-col gap-2 mt-2.5 col-span-2'>
                <Label>Dependencia Responsable:</Label>
                <Input disabled defaultValue={"Dir. de Mantenimiento y Planificación"} className='disabled:opacity-65' />
                <p className='text-xs text-muted-foreground'>
                  Quien revisa la orden de trabajo.
                </p>
              </div>
            </div>
          </div>
          {/* Selección de tareas */}
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-center">Tareas Manuales</h2>
            <div className="flex flex-col gap-4">
              <Button
                disabled={!selectedAircraft}
                type="button"
                onClick={addEmptyTask}
                variant="outline"
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Agregar Tarea
              </Button>
              <ScrollArea className={cn("flex", tasks.length > 1 ? "h-[550px]" : "")}>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {tasks.map((task, index) => (
                    <div key={index} className="p-4 border rounded-lg mb-2">
                      <div className="flex gap-2 justify-between items-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                          {/* Task Number */}
                          <FormItem>
                            <FormLabel>Número de Tarea</FormLabel>
                            <Input
                              value={task.task_number}
                              onChange={(e) =>
                                updateTask(index, "task_number", e.target.value)
                              }
                              placeholder="Ej: TASK-001"
                            />
                            <FormMessage />
                          </FormItem>
                          {/* Origin Manual */}
                          <FormItem>
                            <FormLabel>Manual de Origen</FormLabel>
                            <Input
                              value={task.origin_manual}
                              onChange={(e) =>
                                updateTask(index, "origin_manual", e.target.value)
                              }
                              placeholder="Ej: Manual..."
                            />
                            <FormMessage />
                          </FormItem>
                          {/* ATA Code */}
                          <FormItem>
                            <FormLabel>Código ATA</FormLabel>
                            <Input
                              value={task.ata}
                              onChange={(e) =>
                                updateTask(index, "ata", e.target.value)
                              }
                              placeholder="Ej: 25"
                            />
                            <FormMessage />
                          </FormItem>
                          {/* Task Description (full width) */}
                          <FormItem className="md:col-span-3">
                            <FormLabel>Descripción de la Tarea</FormLabel>
                            <Textarea
                              value={task.description_task}
                              onChange={(e) =>
                                updateTask(index, "description_task", e.target.value)
                              }
                              placeholder="Describa la tarea..."
                            />
                            <FormMessage />
                          </FormItem>
                        </div>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeTask(index)}
                          className="hover:text-red-500 ml-2"
                        >
                          <MinusCircle className="size-4" />
                        </Button>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Artículos/Partes Necesarias</h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEmptyTaskItem(index)}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Agregar Artículo
                          </Button>
                        </div>

                        <ScrollArea className={cn("", task.task_items.length > 2 ? "h-[295px]" : "")}>
                          {task.task_items.map((item, itemIndex) => (
                            <div key={itemIndex} className="p-3 border rounded-md bg-muted/50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {/* Part Number */}
                                <FormItem>
                                  <FormLabel>Número de Parte*</FormLabel>
                                  <Input
                                    value={item.part_number}
                                    onChange={(e) =>
                                      updateTaskItem(index, itemIndex, "part_number", e.target.value)
                                    }
                                    placeholder="Ej: 1234-5678"
                                  />
                                </FormItem>

                                {/* Alternate Part Number */}
                                <FormItem>
                                  <FormLabel>Número Alternativo</FormLabel>
                                  <Input
                                    value={item.alternate_part_number}
                                    onChange={(e) =>
                                      updateTaskItem(index, itemIndex, "alternate_part_number", e.target.value)
                                    }
                                    placeholder="Ej: 9876-5432"
                                  />
                                </FormItem>

                                {/* Serial */}
                                <FormItem>
                                  <FormLabel>Serial</FormLabel>
                                  <Input
                                    value={item.serial}
                                    onChange={(e) =>
                                      updateTaskItem(index, itemIndex, "serial", e.target.value)
                                    }
                                    placeholder="Ej: SN12345678"
                                  />
                                </FormItem>
                              </div>

                              <div className="flex justify-end mt-2">
                                <Button
                                  variant="ghost"
                                  type="button"
                                  size="sm"
                                  onClick={() => removeTaskItem(index, itemIndex)}
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
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>


          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={createWorkOrder.isPending} type="submit">{createWorkOrder.isPending ? <Loader2 className='animate-spin size-4' /> : "Crear Orden de Trabajo"}</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default NonServiceWorkOrderForm
