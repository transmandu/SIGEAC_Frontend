'use client';
import { useCreateWorkOrder } from '@/actions/planificacion/ordenes_trabajo/actions';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGetMaintenanceAircrafts } from '@/hooks/planificacion/useGetMaintenanceAircrafts';
import { useGetServicesByManufacturer } from '@/hooks/planificacion/useGetServicesByManufacturer';
import { cn } from '@/lib/utils';
import { useCompanyStore } from '@/stores/CompanyStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, MinusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCheckWorkOrderArticles } from '@/hooks/planificacion/useCheckWorkOrderArticles';
import { toast } from 'sonner';
// Esquema de validación con Zod
interface TaskItem {
  id: number;
  article_part_number: string;
  article_alt_part_number?: string;
  article_serial: string;
}

interface Task {
  id: number;
  description: string;
  task_items: TaskItem[];
}

interface Service {
  id: number;
  name: string;
  description: string;
  origin_manual: string;
  type: string;
  tasks: Task[];
}

interface SelectedTask {
  task_id: number;
  description: string;
  service_id: number;
  service_name: string;
  ata: string;
  task_items: TaskItem[];
}

interface ArticleAvailability {
  article: string;
  available: boolean;
  location?: string;
  warehouse?: string;
}

const workOrderSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  elaborated_by: z.string().min(1, 'Elaborado por es obligatorio'),
  approved_by: z.string().min(1, 'Aprobado por es obligatorio'),
  reviewed_by: z.string().min(1, 'Revisado por es obligatorio'),
  location_id: z.string().min(1, 'La ubicación es obligatoria'),
  aircraft_id: z.string().min(1, 'La aeronave es obligatoria'),
  date: z.date(),
  work_order_task: z.array(z.object({
    task_id: z.number().min(1, 'ID de tarea inválido'),
    ata: z.string().min(1, 'El código ATA es obligatorio')
  })).min(1, 'Debe seleccionar al menos una tarea'),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

const ServiceWorkOrderForm = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [articleAvailability, setArticleAvailability] = useState<ArticleAvailability[]>([]);
  const { selectedStation } = useCompanyStore();
  const { createWorkOrder } = useCreateWorkOrder();
  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts();
  const { data: services, isLoading: isServicesLoading } = useGetServicesByManufacturer(selectedAircraft);
  const { data, mutateAsync: check_mutate, isPending: isCheckLoading } = useCheckWorkOrderArticles()
  const router = useRouter();

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      elaborated_by: 'Ing. Francisco Montilla',
      reviewed_by: 'José Flores',
      approved_by: "Fátima Dos Ramos",
      description: '',
      aircraft_id: '',
    },
  });

  useEffect(() => {
    if (selectedStation) {
      form.setValue('location_id', selectedStation);
    } else {
      // Manejar el caso donde selectedStation es undefined
      form.setError('location_id', {
        type: 'manual',
        message: 'Debe seleccionar una ubicación'
      });
    }
  }, [selectedStation, form]);

  const handleCheckTaskItems = async () => {
    try {
      const taskIds = selectedTasks.map(task => task.task_id);
      const result = await check_mutate(taskIds);
      setArticleAvailability(result);
      // Mostrar notificación o alerta con los resultados
      const availableCount = result.filter(item => item.available).length;
      if (availableCount > 0) {
        toast.success(`${availableCount} artículo(s) disponibles en almacén.`);
      } else {
        toast.warning("Ningún artículo disponible en almacén");
      }
    } catch (error) {
      toast.error("Error al verificar artículos");
    }
  };

  const handleTaskSelect = (task: Task, service: Service) => {
    setSelectedTasks(prev => {
      const exists = prev.some(t => t.task_id === task.id);

      if (exists) {
        return prev.filter(t => t.task_id !== task.id);
      }

      return [
        ...prev,
        {
          task_id: task.id,
          description: task.description,
          service_id: service.id,
          service_name: service.name,
          ata: "",
          task_items: task.task_items
        }
      ];
    });
  };

  const handleServiceSelect = (serviceId: number) => {
    if (!services) return;

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const allServiceTasksSelected = service.tasks.every(task =>
      selectedTasks.some(t => t.task_id === task.id)
    );

    if (allServiceTasksSelected) {
      // Deseleccionar todas
      setSelectedTasks(prev =>
        prev.filter(task =>
          !service.tasks.some(t => t.id === task.task_id)
        )
      );
    } else {
      // Seleccionar todas
      const newTasks = service.tasks
        .filter(task => !selectedTasks.some(t => t.task_id === task.id))
        .map(task => ({
          task_id: task.id,
          description: task.description,
          service_id: service.id,
          service_name: service.name,
          ata: "",
          task_items: task.task_items
        }));

      setSelectedTasks(prev => [...prev, ...newTasks]);
    }
  };

  const handleAtaChange = (taskId: number, value: string) => {
    setSelectedTasks(prev =>
      prev.map(task =>
        task.task_id === taskId ? { ...task, ata: value } : task
      )
    );
  };

  const removeTask = (taskId: number) => {
    setSelectedTasks(prev => prev.filter(task => task.task_id !== taskId));
  };

  useEffect(() => {
    form.setValue("work_order_task", selectedTasks.map(task => ({
      task_id: task.task_id,
      ata: task.ata
    })));
  }, [selectedTasks, form]);

  const onSubmit = async (data: WorkOrderFormValues) => {
    const formattedData = {
      ...data,
      date: format(data.date, "yyyy-MM-dd"),
      work_order_task: data.work_order_task.map(task => ({
        task_id: task.task_id.toString(),
        ata: task.ata
      })),
    };
    //await createWorkOrder.mutateAsync(formattedData);
    form.reset();
    router.push('/hangar74/planificacion/ordenes_trabajo');
  };

  // Agrupar por servicio para el panel izquierdo
  const servicesWithCount = services?.map(service => {
    const selectedCount = service.tasks.filter(task =>
      selectedTasks.some(t => t.task_id === task.id)
    ).length;
    return {
      ...service,
      selectedCount,
      allSelected: service.tasks.length > 0 && selectedCount === service.tasks.length,
      someSelected: selectedCount > 0 && selectedCount < service.tasks.length
    };
  });


  return (
    <div className="space-y-6">
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
                            disabled={isAircraftsLoading}
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
            <h2 className="text-3xl font-semibold text-center">Seleccionar Tareas</h2>

            {!selectedAircraft ? (
              <div className='flex justify-center'>
                <h1 className='text-xl text-muted-foreground italic'>¡Seleccione una aeronave para ver sus tareas!</h1>
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="work_order_task"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tareas a Realizar</FormLabel>
                      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-between"
                            disabled={isServicesLoading}
                          >
                            <span>
                              {selectedTasks.length > 0
                                ? `${selectedTasks.length} tarea(s) seleccionada(s)`
                                : "Seleccionar tareas..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Seleccionar Tareas</DialogTitle>
                            <div className="flex items-center gap-2 pt-2">
                              <Input
                                placeholder="Buscar tareas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <Badge variant="outline" className="ml-2 text-center">
                                {selectedTasks.length} seleccionadas
                              </Badge>
                            </div>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-grow overflow-hidden">
                            {/* Panel de servicios */}
                            <div className="border-r pr-4 overflow-y-auto col-span-1">
                              <h3 className="font-bold mb-2">Servicios</h3>
                              <div className="space-y-1">
                                {servicesWithCount?.map(service => (
                                  <div
                                    key={service.id}
                                    className={`p - 2 rounded cursor - pointer flex justify - between items - center ${selectedService === service.id ? 'bg-blue-50' : ''} `}
                                    onClick={() => setSelectedService(service.id)}
                                  >
                                    <span className="truncate">{service.name}</span>
                                    {service.selectedCount > 0 && (
                                      <Badge variant="secondary" className="ml-2">
                                        {service.selectedCount}/{service.tasks.length}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Lista de tareas */}
                            <div className="col-span-4 overflow-y-auto">
                              {services?.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-muted-foreground">No se encontraron tareas</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {services
                                    ?.filter(service =>
                                      !selectedService || service.id === selectedService
                                    )
                                    .map(service => (
                                      <div key={service.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h3 className="font-medium text-lg">
                                            {service.name} - {service.origin_manual}
                                          </h3>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleServiceSelect(service.id)}
                                          >
                                            Seleccionar todas
                                          </Button>
                                        </div>
                                        <div className="space-y-2 pl-2">
                                          {service.tasks.map(task => (
                                            <div
                                              key={task.id}
                                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                                            >
                                              <Checkbox
                                                checked={selectedTasks.some(t => t.task_id === task.id)}
                                                onCheckedChange={() => handleTaskSelect(task, service)}
                                              />
                                              <Label className="flex-grow">{task.description}</Label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                              {/* Tabla de verificación simplificada */}
                              {articleAvailability.length > 0 && (
                                <Card className="mt-4">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <Check className="h-5 w-5 text-green-500" />
                                      Disponibilidad de Artículos
                                      <Badge variant="outline" className="ml-auto">
                                        {articleAvailability.filter(item => item.available).length}/{articleAvailability.length} disponibles
                                      </Badge>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Artículo</TableHead>
                                            <TableHead>Almacén</TableHead>
                                            <TableHead>Ubicación</TableHead>
                                            <TableHead className="text-center">Estado</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {articleAvailability.map((item, index) => (
                                            <TableRow key={index} className={cn(
                                              !item.available && "opacity-70 bg-gray-50 dark:bg-gray-900"
                                            )}>
                                              <TableCell>{index + 1}</TableCell>
                                              <TableCell className="font-mono font-medium">
                                                {item.article}
                                              </TableCell>
                                              <TableCell>
                                                {item.warehouse || (
                                                  <span className="text-muted-foreground text-center">N/A</span>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {item.location || (
                                                  <span className="text-muted-foreground text-center">N/A</span>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-center">
                                                {item.available ? (
                                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-300 cursor-pointer">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Disponible
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="destructive" className='cursor-pointer'>
                                                    <MinusCircle className="h-3 w-3 mr-1" />
                                                    No disponible
                                                  </Badge>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </CardContent>
                                  <CardFooter className="text-xs text-muted-foreground flex justify-between">
                                    <div>
                                      {articleAvailability.filter(item => item.available).length > 0 ? (
                                        <span className="text-green-600 flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          {articleAvailability.filter(item => item.available).length} artículos disponibles en almacén.
                                        </span>
                                      ) : (
                                        <span className="text-yellow-600 flex items-center gap-1">
                                          <AlertCircle className="h-3 w-3" />
                                          Ningún artículo disponible en almacén
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      Última verificación: {new Date().toLocaleTimeString()}
                                    </div>
                                  </CardFooter>
                                </Card>
                              )}
                            </div>
                          </div>

                          <DialogFooter className="flex justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsTaskModalOpen(false)}
                            >
                              Cancelar
                            </Button>

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCheckTaskItems}
                                disabled={isCheckLoading}
                              >
                                {isCheckLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Verificar Artículos
                              </Button>

                              <Button
                                type="button"
                                onClick={() => setIsTaskModalOpen(false)}
                              >
                                Confirmar selección
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <FormDescription className="text-xs">
                        Seleccione las tareas que incluirá esta orden de trabajo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lista de tareas seleccionadas con detalles */}
                <div className="mt-4 space-y-4">
                  {selectedTasks.length === 0 ? (
                    <div className="flex items-center justify-center p-8 border rounded-lg">
                      <p className="text-muted-foreground">No hay tareas seleccionadas</p>
                    </div>
                  ) : (
                    <ScrollArea className={cn("flex", selectedTasks.length > 1 ? "h-[600px]" : "")}>
                      <div className='space-y-4 flex gap-2 items-center'>
                        {selectedTasks.sort((a, b) => b.task_items.length - a.task_items.length).map((task) => (
                          <Card key={task.task_id} className="p-4 w-[350px]">
                            <CardHeader className="p-0 pb-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                  {task.description}
                                </CardTitle>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  size="icon"
                                  onClick={() => removeTask(task.task_id)}
                                  className="hover:text-red-500"
                                >
                                  <MinusCircle className="size-4" />
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Servicio: {task.service_name}
                              </div>
                            </CardHeader>

                            <CardContent className="p-0 space-y-4 flex flex-col justify-center">
                              {/* Campo ATA */}
                              <div className="w-full max-w-xs">
                                <Label>Código ATA</Label>
                                <Input
                                  required
                                  value={task.ata}
                                  onChange={(e) =>
                                    handleAtaChange(task.task_id, e.target.value)
                                  }
                                  placeholder="Ej: 25-10-00"
                                />
                              </div>

                              {/* Materiales/Partes */}
                              {task.task_items.length > 0 && (
                                <div className="space-y-2">
                                  <Label className="block">Materiales/Partes requeridas</Label>
                                  <div className="rounded-md border">
                                    <ScrollArea className={cn("", task.task_items.length > 3 ? "h-[200px]" : "")}>
                                      <Table>
                                        <TableHeader className="sticky top-0 bg-background">
                                          <TableRow>
                                            <TableHead>N° Parte</TableHead>
                                            <TableHead>Alterno</TableHead>
                                            <TableHead>Serial</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {task.task_items.map((item) => (
                                            <TableRow key={item.id}>
                                              <TableCell>{item.article_part_number}</TableCell>
                                              <TableCell>{item.article_alt_part_number || '-'}</TableCell>
                                              <TableCell>{item.article_serial}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </ScrollArea>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/hangar74/planificacion/ordenes_trabajo')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createWorkOrder.isPending || selectedTasks.length === 0}
            >
              {createWorkOrder.isPending ? (
                <Loader2 className='animate-spin size-4' />
              ) : "Crear Orden de Trabajo"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ServiceWorkOrderForm
