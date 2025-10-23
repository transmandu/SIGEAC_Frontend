"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions"
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId"
import { useGetClients } from "@/hooks/general/clientes/useGetClients"
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
import { ManufacturerCombobox } from "./ManufacturerCombobox"

// Función para formatear números según el separador decimal detectado
const fmtNumber = (n: unknown): string => {
  if (n == null || n === "") return ""
  
  const str = String(n).trim()
  if (!str) return ""
  
  const lastDot = str.lastIndexOf(".")
  const lastComma = str.lastIndexOf(",")
  
  // Determinar locale y parsear según posición de separadores
  const isEuropean = lastComma > lastDot || (lastComma !== -1 && lastDot === -1)
  const num = isEuropean 
    ? Number(str.replace(/\./g, "").replace(",", "."))
    : Number(str.replace(/,/g, ""))
  
  if (isNaN(num)) return ""
  
  return num.toLocaleString(isEuropean ? "de-DE" : "en-US", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// Esquema de validación para el Paso 1 (Información de la aeronave)
const AircraftInfoSchema = z.object({
  manufacturer_id: z.string().min(1, "Debe seleccionar un fabricante"),
  client_name: z.string().min(1, "El nombre del cliente es obligatorio"),
  authorizing: z.enum(["PROPIETARIO", "EXPLOTADOR"], {
    required_error: "Debe seleccionar el tipo de autorización",
  }),
  serial: z.string().min(1, "El serial es obligatorio"),
  model: z.string().min(1, "El modelo es obligatorio"),
  acronym: z.string().min(1, "La matrícula es obligatoria"),
  flight_hours: z.string()
    .min(1, "Las horas de vuelo son obligatorias")
    .refine((val) => {
      if (!val || val.trim() === "") return false;
      // Soportar ambos formatos: punto y coma como decimal
      const normalized = val.replace(/\./g, "").replace(",", ".");
      const num = parseFloat(normalized);
      return !isNaN(num) && num >= 0;
    }, "Debe ser un número mayor o igual a 0"),
  flight_cycles: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && Number.isInteger(Number(val));
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
  const { data: locations, isPending: isLocationsLoading, isError: isLocationsError, mutate } = useGetLocationsByCompanyId();
  const { data: manufacturers, isLoading: isManufacturersLoading, isError: isManufacturersError } = useGetManufacturers(selectedCompany?.slug);
  const { data: clients } = useGetClients(selectedCompany?.slug);
  
  // Estados para el combobox de clientes
  const [openClient, setOpenClient] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [newClientAuthorizing, setNewClientAuthorizing] = useState<"PROPIETARIO" | "EXPLOTADOR">("PROPIETARIO");

  useEffect(() => {
    mutate(2)
  }, [mutate])
  
  const form = useForm<AircraftInfoType>({
    resolver: zodResolver(AircraftInfoSchema),
    defaultValues: initialData || {},
  });

  // Actualizar formulario cuando lleguen los initialData
  useEffect(() => {
    if (initialData) {
      // Formatear flight_hours si existe
      const formattedData = { ...initialData };
      if (initialData.flight_hours && initialData.flight_hours !== "") {
        const formatted = fmtNumber(initialData.flight_hours);
        if (formatted) {
          formattedData.flight_hours = formatted;
        }
      }
      
      // Resetear el formulario con los datos formateados
      form.reset(formattedData);
      
      // Sincronizar el valor de búsqueda del cliente
      if (initialData.client_name) {
        setClientSearchValue(initialData.client_name);
      }
    }
  }, [initialData, form]);

  // Establecer automáticamente la primera ubicación disponible
  useEffect(() => {
    if (locations && locations.length > 0 && !form.getValues("location_id")) {
      const firstLocationId = locations[0].id.toString();
      form.setValue("location_id", firstLocationId);
    }
  }, [locations, form]);

  const onSubmit = (data: AircraftInfoType) => {
    // Convertir flight_hours de formato visual a número
    const flightHoursValue = data.flight_hours;
    if (flightHoursValue && typeof flightHoursValue === 'string' && flightHoursValue.trim() !== '') {
      // Detectar formato y normalizar correctamente
      const lastDot = flightHoursValue.lastIndexOf('.');
      const lastComma = flightHoursValue.lastIndexOf(',');
      
      let normalized: string;
      if (lastComma > lastDot) {
        // Formato europeo: 1.234,50 → eliminar puntos, cambiar coma por punto
        normalized = flightHoursValue.replace(/\./g, "").replace(",", ".");
      } else {
        // Formato US: 1,234.50 → eliminar comas, mantener punto
        normalized = flightHoursValue.replace(/,/g, "");
      }
      
      const num = parseFloat(normalized);
      
      if (!isNaN(num)) {
        // Redondear a 2 decimales para evitar problemas de precisión
        const rounded = Math.round(num * 100) / 100;
        data.flight_hours = rounded.toFixed(2);
      } else {
        // Si no es un número válido, mostrar error
        form.setError('flight_hours', {
          type: 'manual',
          message: 'El valor ingresado no es un número válido'
        });
        return;
      }
    } else {
      // Si el campo está vacío, mostrar error
      form.setError('flight_hours', {
        type: 'manual',
        message: 'Las horas de vuelo son obligatorias'
      });
      return;
    }
    
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3">
        <div className="mt-6"></div> {/* Separación después de los tabs */}
        <div className='grid grid-cols-2 w-full gap-4'>
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Nombre del Cliente *</FormLabel>
                <Popover open={openClient} onOpenChange={(open) => {
                  setOpenClient(open);
                  if (!open) {
                    setShowCreateClientForm(false);
                    setNewClientAuthorizing("PROPIETARIO");
                  }
                }}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Seleccionar o escribir cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar o escribir cliente..." 
                        value={clientSearchValue}
                        onValueChange={(value) => {
                          setClientSearchValue(value);
                          // Actualizar el campo del formulario mientras escribe
                          form.setValue("client_name", value);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-3">
                            {!showCreateClientForm ? (
                              <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                              No se encontró &quot;{clientSearchValue}&quot;
                            </p>
                                <Button
                                  size="sm"
                                  onClick={() => setShowCreateClientForm(true)}
                                  disabled={!clientSearchValue.trim()}
                                >
                                  Crear cliente &quot;{clientSearchValue}&quot;
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-center">
                                  <p className="text-sm font-medium mb-2">
                                    Crear cliente: &quot;{clientSearchValue}&quot;
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    Tipo de Autorización *
                                  </label>
                                  <Select 
                                    value={newClientAuthorizing} 
                                    onValueChange={(value: "PROPIETARIO" | "EXPLOTADOR") => setNewClientAuthorizing(value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                                      <SelectItem value="EXPLOTADOR">Explotador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setShowCreateClientForm(false);
                                      setNewClientAuthorizing("PROPIETARIO");
                                    }}
                                    className="flex-1"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Solo establecer valores en el formulario
                                      form.setValue("client_name", clientSearchValue);
                                      form.setValue("authorizing", newClientAuthorizing);
                                      setOpenClient(false);
                                      setShowCreateClientForm(false);
                                    }}
                                    className="flex-1"
                                  >
                                    Crear
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {clients
                            ?.filter((client: any) => client.authorizing) // Solo mostrar clientes con authorizing
                            ?.map((client: any) => (
                            <CommandItem
                              value={client.name}
                              key={client.id}
                              onSelect={(currentValue) => {
                                const selectedClient = clients?.find(c => c.name === currentValue) as any;
                                form.setValue("client_name", currentValue);
                                if (selectedClient?.authorizing) {
                                  form.setValue("authorizing", selectedClient.authorizing);
                                } else {
                                  form.setValue("authorizing", "PROPIETARIO");
                                }
                                setClientSearchValue(currentValue);
                                setOpenClient(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  client.name === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name}
                              <span className="ml-auto text-xs text-muted-foreground">
                                {client.authorizing === "PROPIETARIO" ? "Prop." : "Expl."}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Seleccione un cliente existente o escriba un nombre para crear uno nuevo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <ManufacturerCombobox
                value={field.value}
                onChange={field.onChange}
                manufacturers={manufacturers}
                isLoading={isManufacturersLoading}
                isError={isManufacturersError}
                label="Fabricante"
                description="Fabricante de la aeronave."
                placeholder="Seleccionar o crear fabricante..."
                filterType="AIRCRAFT"
                showTypeSelector={false}
              />
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
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="YVXXXX" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Matrícula identificadora de la aeronave.
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        {/* Año de Fabricación - fila completa */}
        <div className="w-full">
           <FormField
            control={form.control}
            name="fabricant_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel className="text-sm font-medium text-foreground">Año de Fabricación</FormLabel>
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
                            {format(field.value, "yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Seleccione un año</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4 shadow-lg border border-border" align="start">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-center">Seleccione el año de fabricación</div>
                      <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
                        {Array.from({ length: new Date().getFullYear() - 1960 + 1 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          const isSelected = field.value && new Date(field.value).getFullYear() === year;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                // Establecer el 1 de enero del año seleccionado
                                field.onChange(new Date(year, 0, 1));
                              }}
                              className={cn(
                                "px-3 py-2 text-sm rounded-md transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
                    type="text"
                    placeholder="Ej: 15000"
                    value={field.value || ""}
                    onChange={(e) => {
                      // Permitir escribir libremente, solo filtrar caracteres no válidos
                      const value = e.target.value.replace(/[^\d.,]/g, '');
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!value) {
                        // Si está vacío, no hacer nada (la validación del form lo manejará)
                        return;
                      }
                      
                      // Detectar formato y normalizar correctamente
                      const lastDot = value.lastIndexOf('.');
                      const lastComma = value.lastIndexOf(',');
                      
                      let normalized: string;
                      if (lastComma > lastDot) {
                        // Formato europeo: 1.234,50 → eliminar puntos, cambiar coma por punto
                        normalized = value.replace(/\./g, "").replace(",", ".");
                      } else {
                        // Formato US: 1,234.50 → eliminar comas, mantener punto
                        normalized = value.replace(/,/g, "");
                      }
                      
                      const num = parseFloat(normalized);
                      
                      if (!isNaN(num)) {
                        // Redondear a 2 decimales
                        const rounded = Math.round(num * 100) / 100;
                        // Formatear para visualización
                        const formatted = fmtNumber(String(rounded));
                        if (formatted) {
                          field.onChange(formatted);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Horas totales de vuelo de la aeronave (máx. 2 decimales).
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
                  Ciclos totales de la aeronave (número entero).
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
