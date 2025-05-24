'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useGetMaintenanceAircrafts } from '@/hooks/planificacion/useGetMaintenanceAircrafts';
import { useGetServicesByManufacturer } from '@/hooks/planificacion/useGetServicesByManufacturer';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { useCompanyStore } from '@/stores/CompanyStore';

// Esquema de validación con Zod
const workOrderSchema = z.object({
  order_number: z.string().min(1, 'El número de la orden es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  elaborated_by: z.string().min(1, 'Elaborado por es obligatorio'),
  approved_by: z.string().min(1, 'Aprobado por es obligatorio'),
  reviewed_by: z.string().min(1, 'Revisado por es obligatorio'),
  location_id: z.string().min(1, 'La ubicación es obligatoria'),
  aircraft_id: z.string(),
  date: z.date(),
  tasks: z.array(z.object({
    id: z.number(),
    description: z.string(),
    selected: z.boolean(),
    technician_responsable: z.string().optional(),
    inspector_responsable: z.string().optional(),
  })),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

export default function WorkOrderPage() {
  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts();
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const { selectedStation } = useCompanyStore()
  const { data: services, isLoading: isServicesLoading, isError: isServicesError } = useGetServicesByManufacturer(selectedAircraft);

  // Inicializar React Hook Form con Zod
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      elaborated_by: 'Ing. Francisco Montilla',
      reviewed_by: 'José Flores',
      approved_by: "Fátima Dos Ramos",
      order_number: '',
      description: '',
      aircraft_id: '',
      tasks: services?.flatMap((service) =>
        service.tasks.map((task) => ({
          id: task.id,
          description: task.description,
          selected: false,
          technician_responsable: "",
          inspector_responsable: "",
        }))
      ),
    },
  });

  // Obtener las tareas del formulario
  const { fields: tasks, replace } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  useEffect(() => {
    if (selectedStation) {
      form.setValue('location_id', selectedStation)
    }
  }, [selectedStation, form])

  useEffect(() => {
    if (services) {
      const tasks = services.flatMap((service) =>
        service.tasks.map((task) => ({
          id: task.id,
          description: task.description,
          selected: false,
          technician_responsable: '',
          inspector_responsable: '',
        }))
      );
      replace(tasks);
    }
  }, [services, replace]);
  const selectedTasks = form.getValues("tasks")?.filter((task) => task.selected);
  const onSubmit = (data: WorkOrderFormValues) => {
    const selectedTasks = data.tasks.filter((task) => task.selected);
    console.log('Orden de trabajo guardada:', {
      ...data,
      tasks: selectedTasks,
    });
  };

  return (
    <ContentLayout title='Creacion de WO'>
      <div className="p-6 space-y-6">
        {/* Cabecera */}
        <h1 className="text-2xl font-bold">Crear Orden de Trabajo</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className='flex gap-6 items-center justify-center w-full'>
              <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de la orden</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: OT-001" />
                      </FormControl>
                      <FormDescription className="text-sm">
                        Número de la orden de trabajo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                              <CommandEmpty className="text-sm p-2 text-center">No se ha encontrado ninguna aeronave.</CommandEmpty>
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
                      <FormDescription className="text-sm">
                        Aeronave que recibirá el servicio.
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
                <div className='flex flex-col gap-2 mt-2.5'>
                  <Label>Dependencia Responsable:</Label>
                  <Input disabled defaultValue={"Dir. de Mantenimiento y Planificación"} className='disabled:opacity-65' />
                  <p className='text-sm text-muted-foreground'>
                    Quien revisa la orden de trabajo.
                  </p>
                </div>
              </div>
            </div>
            {/* Selección de servicios y tareas */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Seleccionar Tareas</h2>
              {isServicesLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              ) : isServicesError ? (
                <div className="text-red-500 text-center">Error al cargar los servicios.</div>
              ) : (
                services?.map((service) => (
                  <div key={service.id} className="mb-6">
                    <h3 className="text-lg font-medium">{service.name}</h3>
                    <div className="space-y-2">
                      {service.tasks.map((task) => (
                        <div key={task.id} className="space-y-2">
                          <FormField
                            control={form.control}
                            name={`tasks.${task.id}.selected`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked); // Actualiza el estado de la tarea
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {task.description}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          {form.watch(`tasks.${task.id}.selected`) && (
                            <>
                              <FormField
                                control={form.control}
                                name={`tasks.${task.id}.technician_responsable`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Técnico Responsable</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Nombre del técnico" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`tasks.${task.id}.inspector_responsable`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Inspector Responsable</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Nombre del inspector" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
}
