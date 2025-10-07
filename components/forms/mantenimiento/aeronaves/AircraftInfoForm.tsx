"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useGetClients } from "@/hooks/general/clientes/useGetClients"
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions"
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar } from "../../../ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Textarea } from "../../../ui/textarea"

// Esquema de validación para el Paso 1 (Información de la aeronave)
const AircraftInfoSchema = z.object({
  manufacturer_id: z.string().min(1, "Debe seleccionar un fabricante"),
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  serial: z.string().min(1, "El serial es obligatorio"),
  model: z.string().min(1, "El modelo es obligatorio"),
  acronym: z.string().min(1, "El acrónimo es obligatorio"),
  flight_hours: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Debe ser un número entero mayor o igual a 0"),
  flight_cycles: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Debe ser un número entero mayor o igual a 0"),
  fabricant_date: z.date(),
  comments: z.string().optional(),
  location_id: z.string().min(1, "La ubicación es obligatoria"),
});

type AircraftInfoType = z.infer<typeof AircraftInfoSchema>;

interface AircraftInfoFormProps {
  onNext: (data: AircraftInfoType) => void; // Función para avanzar al siguiente paso
  onBack?: () => void; // Función para retroceder (opcional)
  initialData?: Partial<AircraftInfoType>; // Datos iniciales (opcional)
}

export function AircraftInfoForm({ onNext, onBack, initialData }: AircraftInfoFormProps) {
  const {selectedCompany} = useCompanyStore()
  const { data: clients, isLoading: isClientsLoading, isError: isClientsError } = useGetClients(selectedCompany?.slug);
  const { data: locations, isPending: isLocationsLoading, isError: isLocationsError, mutate } = useGetLocationsByCompanyId();
  const { data: manufacturers, isLoading: isManufacturersLoading, isError: isManufacturersError } = useGetManufacturers(selectedCompany?.slug);

  // Estado para controlar el mes que se muestra en el calendario
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  useEffect(() => {
    mutate(2)
  }, [mutate])
  
  const form = useForm<AircraftInfoType>({
    resolver: zodResolver(AircraftInfoSchema),
    defaultValues: initialData || {},
  });

  // Establecer automáticamente la primera ubicación disponible
  useEffect(() => {
    if (locations && locations.length > 0 && !form.getValues("location_id")) {
      const firstLocationId = locations[0].id.toString();
      form.setValue("location_id", firstLocationId);
    }
  }, [locations, form]);

  const onSubmit = (data: AircraftInfoType) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className='grid grid-cols-2 w-full gap-4'>
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3 mt-1.5">
                <FormLabel>Cliente</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isClientsLoading || isClientsError}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {
                          isClientsLoading && <Loader2 className="size-4 animate-spin mr-2" />
                        }
                        {field.value
                          ? <p>{clients?.find(
                            (client) => `${client.id.toString()}` === field.value
                          )?.name}</p>
                          : "Elige al cliente..."
                        }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Busque un cliente..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">No se ha encontrado ningún cliente.</CommandEmpty>
                        <CommandGroup>
                          {clients?.map((client) => (
                            <CommandItem
                              value={`${client.id}`}
                              key={client.id}
                              onSelect={() => {
                                form.setValue("client_id", client.id.toString())
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  `${client.id.toString()}` === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {
                                <p>{client.name}</p>
                              }
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Cliente propietario de la aeronave.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3 mt-1.5">
                <FormLabel>Fabricante</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={isManufacturersLoading || isManufacturersError}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {
                          isClientsLoading && <Loader2 className="size-4 animate-spin mr-2" />
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
                          {manufacturers?.filter((m) => m.type === 'AIRCRAFT').map((manufacturer) => (
                            <CommandItem
                              value={`${manufacturer.id}`}
                              key={manufacturer.id}
                              onSelect={() => {
                                form.setValue("manufacturer_id", manufacturer.id.toString())
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
                  Fabricante de la aeronave.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Modelo de la aeronave..." {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Serial identificador de la aeronave.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial</FormLabel>
                  <FormControl>
                    <Input placeholder="Serial de la aeronave..." {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Serial identificador de la aeronave.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="acronym"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acronimo</FormLabel>
                <FormControl>
                  <Input placeholder="YVXXXX" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Acronimo identificador de la aeronave.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        {/* Fecha de Fabricación - fila completa */}
        <div className="w-full">
           <FormField
            control={form.control}
            name="fabricant_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel className="text-sm font-medium text-foreground">Fecha de Fabricación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        {field.value ? (
                          <span className="font-normal">
                            {format(field.value, "dd 'de' MMMM 'de' yyyy", {
                            locale: es,
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Seleccione una fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-lg border border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      month={displayMonth}
                      onMonthChange={setDisplayMonth}
                      className="p-3"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex flex-col justify-center pt-1 relative items-center space-y-2",
                        caption_label: "text-sm font-medium order-2",
                        caption_dropdowns: "flex justify-center gap-2 order-1",
                        dropdown: "h-8 rounded-md border border-input bg-background px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0 opacity-70 hover:opacity-100"
                        ),
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-xs",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative",
                        day: cn(
                          "inline-flex items-center justify-center rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground"
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground font-semibold",
                        day_disabled: "text-muted-foreground opacity-50",
                      }}
                        components={{
                          Caption: ({ displayMonth: calendarDisplayMonth, ...props }) => {
                            const currentDate = new Date();
                            const currentYear = currentDate.getFullYear();
                            const currentMonth = currentDate.getMonth();

                            const canGoNext = displayMonth.getFullYear() < currentYear ||
                                            (displayMonth.getFullYear() === currentYear && displayMonth.getMonth() < currentMonth);

                            const goToPreviousMonth = () => {
                              const newDate = new Date(displayMonth);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setDisplayMonth(newDate);
                            };

                            const goToNextMonth = () => {
                              if (canGoNext) {
                                const newDate = new Date(displayMonth);
                                newDate.setMonth(newDate.getMonth() + 1);
                                setDisplayMonth(newDate);
                              }
                            };
                          
                          return (
                            <div className="flex flex-col justify-center pt-1 relative items-center space-y-2">
                              <div className="flex justify-center gap-2">
                                <select
                                  value={displayMonth.getMonth()}
                                  onChange={(e) => {
                                    const newDate = new Date(displayMonth);
                                    newDate.setMonth(parseInt(e.target.value));
                                    setDisplayMonth(newDate);
                                  }}
                                  className="h-8 rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-8"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                                  }}
                                >
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>
                                      {format(new Date(2000, i, 1), "MMMM", { locale: es })}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={displayMonth.getFullYear()}
                                  onChange={(e) => {
                                    const newDate = new Date(displayMonth);
                                    newDate.setFullYear(parseInt(e.target.value));
                                    setDisplayMonth(newDate);
                                  }}
                                  className="h-8 rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-8"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                                  }}
                                >
                                  {Array.from({ length: new Date().getFullYear() - 1980 + 1 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                              <div className="flex items-center justify-center gap-3 relative">
                                {/* Botón anterior */}
                                <button
                                  type="button"
                                  onClick={goToPreviousMonth}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0 opacity-70 hover:opacity-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m15 18-6-6 6-6"/>
                                  </svg>
                                </button>
                                
                                <div className="text-sm font-medium min-w-[120px] text-center">
                                  {format(displayMonth, "MMMM yyyy", { locale: es })}
                                </div>
                                
                                {/* Botón siguiente */}
                                <button
                                  type="button"
                                  onClick={goToNextMonth}
                                  disabled={!canGoNext}
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0 opacity-70 hover:opacity-100 disabled:opacity-30"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        },
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        {/* Horas de Vuelo y Ciclos - en la misma fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="flight_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas de Vuelo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 15000"
                    {...field}
                    onKeyDown={(e) => {
                      // Prevenir números negativos y decimales
                      if (e.key === '-' || e.key === '.' || e.key === ',') {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Horas totales de vuelo de la aeronave.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flight_cycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 500"
                    {...field}
                    onKeyDown={(e) => {
                      // Prevenir números negativos y decimales
                      if (e.key === '-' || e.key === '.' || e.key === ',') {
                        e.preventDefault();
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Ciclos totales de la aeronave.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        {/* Campo de ubicación oculto - se asigna automáticamente */}
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
            <FormItem className="hidden">
                  <FormControl>
                <input type="hidden" {...field} />
                  </FormControl>
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios</FormLabel>
              <FormControl>
                <Textarea placeholder="Aeronave de - " {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Comentarios adicionales.
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center gap-x-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Anterior
            </Button>
          )}
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
