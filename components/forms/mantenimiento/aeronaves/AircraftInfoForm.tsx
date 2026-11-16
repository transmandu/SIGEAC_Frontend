"use client";

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
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useGetClients } from "@/hooks/mantenimiento/clientes/useGetClients";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { zodResolver } from "@/lib/zod-resolver";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ManufacturerCombobox } from "./ManufacturerCombobox";
import { formatNumber, parseDecimalInput } from "@/lib/formatNumber";
import { locationLabel } from "@/lib/locations";

/** Los vuelos acumulan hasta 3 decimales; redondear a menos cambiaba el total al editar. */
const roundHours = (n: number) => Math.round(n * 1000) / 1000;

/** El valor como se muestra en el campo: 15.000,50. */
const displayHours = (n: number) =>
  formatNumber(roundHours(n), { minDecimals: 2, maxDecimals: 3 });

// Esquema de validación para el Paso 1 (Información de la aeronave)
const AircraftInfoSchema = z.object({
  manufacturer_id: z.string().min(1, "Debe seleccionar un fabricante"),
  client_name: z.string().min(1, "El nombre del cliente es obligatorio"),
  // Solo hace falta para un cliente nuevo; se resuelve en onSubmit.
  authorizing: z.enum(["PROPIETARIO", "EXPLOTADOR"]).optional(),
  serial: z.string().min(1, "El serial es obligatorio"),
  model: z.string().min(1, "El modelo es obligatorio"),
  acronym: z.string().min(1, "La matrícula es obligatoria"),
  flight_hours: z
    .string()
    .min(1, "Las horas de vuelo son obligatorias")
    .refine(
      (val) => parseDecimalInput(val) !== null,
      "Debe ser un número mayor o igual a 0",
    ),
  flight_cycles: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && Number.isInteger(Number(val));
  }, "Debe ser un número entero mayor o igual a 0"),
  fabricant_date: z.date({ error: "Seleccione el año de fabricación" }),
  comments: z.string().optional(),
  location_id: z
    .string()
    .min(1, "Seleccione la ubicación donde se le realiza mantenimiento"),
});

type AircraftInfoType = z.infer<typeof AircraftInfoSchema>;
type AircraftInfoSubmit = AircraftInfoType & {
  authorizing: "PROPIETARIO" | "EXPLOTADOR";
};

interface AircraftInfoFormProps {
  onNext: (data: AircraftInfoSubmit) => void; // Función para avanzar al siguiente paso
  onBack?: () => void; // Función para retroceder (opcional)
  initialData?: Partial<AircraftInfoType>; // Datos iniciales (opcional)
}

export function AircraftInfoForm({
  onNext,
  onBack,
  initialData,
}: AircraftInfoFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: locations } = useGetLocationsByCompany(selectedCompany?.slug);
  const {
    data: manufacturers,
    isLoading: isManufacturersLoading,
    isError: isManufacturersError,
  } = useGetManufacturers(selectedCompany?.slug);
  const { data: clients } = useGetClients(selectedCompany?.slug);

  // Estados para el combobox de clientes
  const [openClient, setOpenClient] = useState(false);
  const [showCreateClientForm, setShowCreateClientForm] = useState(false);
  const [newClientAuthorizing, setNewClientAuthorizing] = useState<
    "PROPIETARIO" | "EXPLOTADOR"
  >("PROPIETARIO");

  const form = useForm<AircraftInfoType>({
    resolver: zodResolver(AircraftInfoSchema),
    // Vacíos, no undefined: un campo sin tocar llegaba a zod como `undefined` y
    // fallaba con su mensaje genérico en inglés en vez del propio.
    defaultValues: {
      manufacturer_id: "",
      client_name: "",
      serial: "",
      model: "",
      acronym: "",
      flight_hours: "",
      flight_cycles: "",
      location_id: "",
      comments: "",
      ...initialData,
    },
  });

  // El buscador del combobox refleja siempre client_name: escribir en el
  // input ya hace setValue sobre ese campo, así que no hace falta un estado
  // aparte que lo duplique.
  const clientSearchValue =
    useWatch({ control: form.control, name: "client_name" }) ?? "";

  // Actualizar formulario cuando lleguen los initialData
  useEffect(() => {
    if (initialData) {
      // Formatear flight_hours si existe
      const formattedData = { ...initialData };
      // Los datos iniciales vienen en formato canónico del sistema ("123.456" son
      // 123,456 horas), no tecleados: no pasan por el lector de lo que escribe el usuario.
      const stored = String(initialData.flight_hours ?? "").trim();
      if (stored !== "" && Number.isFinite(Number(stored))) {
        formattedData.flight_hours = displayHours(Number(stored));
      }

      // Resetear el formulario con los datos formateados
      form.reset(formattedData);
    }
  }, [initialData, form]);

  // Con una sola sede no hay nada que elegir.
  useEffect(() => {
    if (locations?.length === 1 && !form.getValues("location_id")) {
      form.setValue("location_id", locations[0].id.toString());
    }
  }, [locations, form]);

  const onSubmit = (values: AircraftInfoType) => {
    const data = { ...values, client_name: values.client_name.trim() };

    // Un cliente que ya existe aporta su autorización; uno nuevo debe crearse
    // desde el combobox ("Crear"), donde se elige. Sin esto, escribir un nombre
    // y cerrar el combobox dejaba el formulario bloqueado sin mensaje visible.
    const existingClient = clients?.find(
      (c: any) =>
        c.name.trim().toUpperCase() === data.client_name.toUpperCase(),
    ) as any;
    const authorizing = existingClient?.authorizing ?? data.authorizing;
    if (!authorizing) {
      form.setError("client_name", {
        type: "manual",
        message:
          "Seleccione un cliente existente o use «Crear cliente» para registrar uno nuevo.",
      });
      return;
    }
    const hours = parseDecimalInput(data.flight_hours);
    if (hours === null) {
      form.setError("flight_hours", {
        type: "manual",
        message: "El valor ingresado no es un número válido",
      });
      return;
    }
    // Se guarda canónico (15000.500): el campo muestra el formato del sistema.
    data.flight_hours = roundHours(hours).toFixed(3);

    onNext({ ...data, authorizing });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <div className="mt-6"></div> {/* Separación después de los tabs */}
        <div className="grid grid-cols-2 w-full gap-4">
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Nombre del Cliente *</FormLabel>
                <Popover
                  open={openClient}
                  onOpenChange={(open) => {
                    setOpenClient(open);
                    if (!open) {
                      setShowCreateClientForm(false);
                      setNewClientAuthorizing("PROPIETARIO");
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground",
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
                        onValueChange={(value) =>
                          form.setValue("client_name", value)
                        }
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-3">
                            {!showCreateClientForm ? (
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                  No se encontró &quot;{clientSearchValue}
                                  &quot;
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => setShowCreateClientForm(true)}
                                  disabled={!clientSearchValue.trim()}
                                >
                                  Crear cliente &quot;{clientSearchValue}
                                  &quot;
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-center">
                                  <p className="text-sm font-medium mb-2">
                                    Crear cliente: &quot;{clientSearchValue}
                                    &quot;
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    Tipo de Autorización *
                                  </label>
                                  <Select
                                    value={newClientAuthorizing}
                                    onValueChange={(
                                      value: "PROPIETARIO" | "EXPLOTADOR",
                                    ) => setNewClientAuthorizing(value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PROPIETARIO">
                                        Propietario
                                      </SelectItem>
                                      <SelectItem value="EXPLOTADOR">
                                        Explotador
                                      </SelectItem>
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
                                      form.setValue(
                                        "client_name",
                                        clientSearchValue,
                                      );
                                      form.setValue(
                                        "authorizing",
                                        newClientAuthorizing,
                                      );
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
                                onSelect={() => {
                                  form.setValue("client_name", client.name, {
                                    shouldValidate: true,
                                  });
                                  form.setValue(
                                    "authorizing",
                                    client.authorizing ?? "PROPIETARIO",
                                  );
                                  setOpenClient(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    client.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {client.name}
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {client.authorizing === "PROPIETARIO"
                                    ? "Prop."
                                    : "Expl."}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Seleccione un cliente existente o escriba un nombre para crear
                  uno nuevo.
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
                <FormItem className="flex-1">
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Modelo de la aeronave..." {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Modelo de la aeronave.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem className="flex-1">
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
                <FormLabel className="text-sm font-medium text-foreground">
                  Año de Fabricación
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                        {field.value ? (
                          <span className="font-normal">
                            {format(field.value, "yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Seleccione un año
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-75 p-4 shadow-lg border border-border"
                    align="start"
                  >
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-center">
                        Seleccione el año de fabricación
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-75 overflow-y-auto">
                        {Array.from(
                          { length: new Date().getFullYear() - 1960 + 1 },
                          (_, i) => {
                            const year = new Date().getFullYear() - i;
                            const isSelected =
                              field.value &&
                              new Date(field.value).getFullYear() === year;
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
                                    : "hover:bg-accent hover:text-accent-foreground",
                                )}
                              >
                                {year}
                              </button>
                            );
                          },
                        )}
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
                      const value = e.target.value.replace(/[^\d.,]/g, "");
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      const num = parseDecimalInput(e.target.value);
                      if (num !== null) {
                        field.onChange(displayHours(num));
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Horas totales de vuelo de la aeronave (máx. 3 decimales).
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
                    min="0"
                    step="1"
                    placeholder="Ej: 500"
                    {...field}
                    onKeyDown={(e) => {
                      // Prevenir números negativos y decimales
                      if (e.key === "-" || e.key === "." || e.key === ",") {
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
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la ubicación..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {locationLabel(location)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Sede donde se le realiza mantenimiento a la aeronave.
              </FormDescription>
              <FormMessage className="text-xs" />
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
