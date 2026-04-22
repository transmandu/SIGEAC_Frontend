"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  useCreateCargoShipment,
  useUpdateCargoShipment,
} from "@/actions/cargo/actions";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetNextGuide } from "@/hooks/operaciones/cargo/useGetNextGuide";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useGetExternalAircraftSuggestions } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";

const itemSchema = z.object({
  product_description: z.string().min(1, "La descripción es requerida"),
  units: z.coerce.number().min(1, "Debe ser al menos 1 unidad"),
  weight: z.coerce.number().min(0.01, "El peso debe ser mayor a 0"),
});

const formSchema = z
  .object({
    registration_date: z.date({ required_error: "La fecha es requerida" }),
    carrier: z.string().min(1, "El transportista es requerido"),
    issuer: z.number().min(1, "El emisor es requerido"),
    pilot: z.string().min(1, "Debe elegir un piloto"),
    copilot: z.string().min(1, "Debe elegir un copiloto"),
    external_aircraft: z.string().optional().nullable(),
    client_id: z.coerce.number().min(1, "Debe elegir un cliente"),
    aircraft_id: z.coerce.number().optional().nullable(),
    items: z.array(itemSchema).min(1, "Debe agregar al menos un producto"),
  })
  .refine((data) => data.aircraft_id || data.external_aircraft, {
    message:
      "Debe Seleccionar una aeronave registrada o ingresar una aeronave externa",
    path: ["aircraft_id"],
  });

export default function CreateCargoShipmentForm({
  onSuccess,
  initialData,
  isExternalMode,
}: {
  onSuccess?: () => void;
  initialData?: any;
  isExternalMode?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const aircraftIdFromUrl = params.aircraft_id;
  const externalNameFromUrl = params.name
    ? decodeURIComponent(params.name as string)
    : null;

  // Acciones (Mutations)
  const isEditing = !!initialData;
  const { createCargoShipment } = useCreateCargoShipment(company);
  const { updateCargoShipment } = useUpdateCargoShipment(company);
  const { data: externalSuggestions } =
    useGetExternalAircraftSuggestions(company);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Consultas a BD
  const { data: clients, isLoading: loadingClients } = useGetClients(company);
  const { data: aircrafts, isLoading: loadingAircrafts } =
    useGetAircrafts(company);
  const { data: employees, isLoading: loadingEmployees } =
    useGetEmployeesByCompany(company);
  const { user } = useAuth();
  const { data: pilots, isLoading: loadingPilots } = useGetPilots(company);

  const carrierPersonnel = employees?.filter((emp: any) =>
    [15, 16, 17].includes(Number(emp.job_title_id)),
  );

  const isExternalAircraft =
    isExternalMode || !!externalNameFromUrl || !!initialData?.external_aircraft;

  // Configuración del formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          registration_date: new Date(
            initialData.registration_date + "T00:00:00",
          ),

          carrier: initialData.carrier,
          issuer: initialData.issuer,
          pilot: initialData.pilot,
          copilot: initialData.copilot || "",
          client_id: initialData.client_id || initialData.client?.id || null,
          aircraft_id:
            initialData.aircraft_id || initialData.aircraft?.id || null,
          external_aircraft: initialData.external_aircraft || null,
          items: initialData.items.map((item: any) => ({
            product_description: item.product_description,
            units: item.units,
            weight: Number(item.weight),
          })),
        }
      : {
          registration_date: new Date(),
          carrier: "",
          issuer: 0,
          pilot: "",
          copilot: "",
          client_id: 0,
          aircraft_id: null,
          external_aircraft: null,
          items: [{ product_description: "", units: 0, weight: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const isPending = createCargoShipment.isPending;

  const watchedItems = form.watch("items");
  const registrationDate = form.watch("registration_date");
  const watchedAircraftId = form.watch("aircraft_id");
  const watchedExternalAircraft = form.watch("external_aircraft");
  useEffect(() => {
    if (user) {
      form.setValue("issuer", Number(user.id));
    }
  }, [user, form]);

  useEffect(() => {
    if (aircraftIdFromUrl && !isEditing) {
      form.setValue("aircraft_id", Number(aircraftIdFromUrl));
    }
  }, [aircraftIdFromUrl, isEditing, form]);

  useEffect(() => {
    if (externalNameFromUrl && !isEditing) {
      form.setValue("external_aircraft", externalNameFromUrl);
    }
  }, [externalNameFromUrl, isEditing, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      registration_date: format(values.registration_date, "yyyy-MM-dd"),
    };

    if (isEditing) {
      updateCargoShipment.mutate(
        { id: initialData.id, data: data },
        {
          onSuccess: () => {
            let path = `/${company}/operaciones/cargo`;
            if (data.aircraft_id) {
              path = `/${company}/operaciones/cargo/${data.aircraft_id}`;
            } else if (data.external_aircraft) {
              path = `/${company}/operaciones/cargo/externa/${encodeURIComponent(data.external_aircraft)}`;
            }
            router.push(path);
          },
        },
      );
    } else {
      createCargoShipment.mutate(data, {
        onSuccess: () => {
          form.reset();
          let path = `/${company}/operaciones/cargo`;
          if (data.aircraft_id) {
            path = `/${company}/operaciones/cargo/${data.aircraft_id}`;
          } else if (data.external_aircraft) {
            path = `/${company}/operaciones/cargo/externa/${encodeURIComponent(data.external_aircraft)}`;
          }
          router.push(path);
        },
      });
    }
  };

  const { data: guideData, isLoading: loadingGuide } = useGetNextGuide(
    company,
    registrationDate
      ? format(registrationDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    watchedAircraftId || null,
    watchedExternalAircraft || null,
  );

  const totalUnits = watchedItems?.reduce(
    (acc, curr) => acc + (Number(curr.units) || 0),
    0,
  );
  const totalWeight = watchedItems?.reduce(
    (acc, curr) => acc + (Number(curr.weight) || 0),
    0,
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLElement).tagName === "INPUT"
          ) {
            e.preventDefault();
          }
        }}
        className="space-y-3"
      >
        {/* === CABECERA === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 border border-border p-4 rounded-xl shadow-sm bg-card">
          {/* Nº Guía (Visualización) */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nº Guía
            </label>
            <div className="flex items-center h-9 relative">
              <Input
                className="h-9 bg-muted/50 font-bold tracking-widest text-primary text-center"
                readOnly
                value={
                  isEditing
                    ? initialData.guide_number
                    : !watchedAircraftId && !watchedExternalAircraft
                      ? "Selec. Aeronave"
                      : loadingGuide
                        ? "..."
                        : guideData?.guide_number || "Cargando..."
                }
              />
            </div>
          </div>

          {/* Fecha */}
          <FormField
            control={form.control}
            name="registration_date"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fecha
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal h-9",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PP", { locale: es })
                        ) : (
                          <span>Seleccione fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={[
                        {
                          before: startOfMonth(
                            isEditing
                              ? new Date(
                                  initialData.registration_date + "T00:00:00",
                                )
                              : new Date(),
                          ),
                        },
                        {
                          after: endOfMonth(
                            isEditing
                              ? new Date(
                                  initialData.registration_date + "T00:00:00",
                                )
                              : new Date(),
                          ),
                        },
                      ]}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cliente */}
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cliente
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingClients}
                        className={cn(
                          "w-full justify-between font-normal h-9",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? clients?.find(
                              (client: any) =>
                                String(client.id) === String(field.value),
                            )?.name ||
                            initialData?.client?.name ||
                            "Seleccionar cliente..."
                          : "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar cliente..." />
                      <CommandList>
                        <CommandEmpty>No se encontró cliente.</CommandEmpty>
                        <CommandGroup>
                          {clients?.map((client: any) => (
                            <CommandItem
                              value={client.name}
                              key={client.id}
                              onSelect={() => {
                                form.setValue("client_id", client.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(client.id) === String(field.value)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aeronave */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-none mt-1">
              Aeronave {isExternalAircraft ? "(Externa)" : ""}
            </label>

            {isExternalAircraft ? (
              <FormField
                control={form.control}
                name="external_aircraft"
                render={({ field }) => {
                  const filteredSuggestions = (
                    externalSuggestions || []
                  ).filter(
                    (suggestion) =>
                      suggestion.includes((field.value || "").toUpperCase()) &&
                      suggestion !== (field.value || "").toUpperCase(),
                  );

                  return (
                    <FormItem className="space-y-0 relative -top-[1px]">
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="h-9 uppercase"
                            placeholder="Ej: YV-206 (Helicóptero)"
                            readOnly={isEditing || !!externalNameFromUrl}
                            autoComplete="off"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                          />

                          {/* sugerencias de las aeronaves externas existentes en el sistema */}
                          {showSuggestions &&
                            !isEditing &&
                            !externalNameFromUrl &&
                            filteredSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                {filteredSuggestions.map((suggestion) => (
                                  <div
                                    key={suggestion}
                                    className="px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      field.onChange(suggestion);
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            ) : (
              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={
                              loadingAircrafts ||
                              isEditing ||
                              !!aircraftIdFromUrl
                            }
                            className={cn(
                              "w-full justify-between font-normal h-9",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? (() => {
                                  const acf = aircrafts?.find(
                                    (a: any) =>
                                      String(a.id) === String(field.value),
                                  );
                                  if (acf)
                                    return (
                                      acf.acronym ||
                                      acf.serial ||
                                      `Aeronave ${acf.id}`
                                    );

                                  if (
                                    initialData?.aircraft &&
                                    String(initialData.aircraft.id) ===
                                      String(field.value)
                                  ) {
                                    return (
                                      initialData.aircraft.acronym ||
                                      initialData.aircraft.serial ||
                                      `Aerovave ....`
                                    );
                                  }
                                  return "Cargando...";
                                })()
                              : "Seleccionar aeronave..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar aeronave..." />
                          <CommandList>
                            <CommandEmpty>
                              No se encontró la aeronave.
                            </CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="ninguna"
                                onSelect={() => {
                                  form.setValue("aircraft_id", null);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === null
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                Ninguna
                              </CommandItem>
                              {aircrafts?.map((acf: any) => {
                                const dispValue =
                                  acf.acronym ||
                                  acf.serial ||
                                  `Aeronave ${acf.id}`;
                                return (
                                  <CommandItem
                                    value={dispValue}
                                    key={acf.id}
                                    onSelect={() => {
                                      form.setValue("aircraft_id", acf.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        String(acf.id) === String(field.value)
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {dispValue}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Transportista */}
          <FormField
            control={form.control}
            name="carrier"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Transportista
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingEmployees}
                        className={cn(
                          "w-full justify-between font-normal h-9",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? employees?.find(
                              (emp: any) =>
                                `${emp.first_name} ${emp.last_name}` ===
                                field.value,
                            )
                            ? field.value
                            : field.value
                          : "Seleccionar empleado..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar empleado..." />
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron empleados.
                        </CommandEmpty>
                        <CommandGroup>
                          {/* Cambiamos 'employees' por 'carrierPersonnel' */}
                          {carrierPersonnel?.map((emp: any) => {
                            const fullName = `${emp.first_name} ${emp.last_name}`;
                            return (
                              <CommandItem
                                value={fullName}
                                key={emp.id}
                                onSelect={() => {
                                  form.setValue("carrier", fullName);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    fullName === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {fullName}
                                <span className="text-muted-foreground ml-1 text-xs">
                                  ({emp.job_title?.name})
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emisor */}
          <FormField
            control={form.control}
            name="issuer"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Emisor
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-9 bg-muted/50 cursor-not-allowed text-left"
                    readOnly
                    value={user ? `${user.first_name} ${user.last_name}` : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tripulación */}
          {/* Piloto */}
          <FormField
            control={form.control}
            name="pilot"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Piloto
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingPilots}
                        className={cn(
                          "w-full justify-between font-normal h-9",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value || "Seleccionar piloto..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar Piloto..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron pilotos</CommandEmpty>
                        <CommandGroup>
                          {pilots?.map((pilot: any) => {
                            const fullName = `${pilot.employee?.first_name} ${pilot.employee?.last_name}`;
                            return (
                              <CommandItem
                                value={fullName}
                                key={pilot.id}
                                onSelect={() =>
                                  form.setValue("pilot", fullName)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    fullName === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {fullName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          {/* Copiloto */}
          <FormField
            control={form.control}
            name="copilot"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Copiloto
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={loadingPilots}
                        className={cn(
                          "w-full justify-between font-normal h-9",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value || "Seleccionar copiloto..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar Copiloto..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron pilotos</CommandEmpty>
                        <CommandGroup>
                          {pilots?.map((pilot: any) => {
                            const fullName = `${pilot.employee?.first_name} ${pilot.employee?.last_name}`;
                            return (
                              <CommandItem
                                value={fullName}
                                key={pilot.id}
                                onSelect={() =>
                                  form.setValue("copilot", fullName)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    fullName === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {fullName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        {/* === ITEMS (TABULAR O GRID Dinámico) === */}
        <div className="border border-border rounded-xl shadow-sm bg-card overflow-hidden">
          {/* Header del Items */}
          <div className="flex justify-between items-center px-4 py-4 border-b border-border/80 bg-muted/20 ">
            <h3 className="font-semibold text-foreground">Productos</h3>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() =>
                append({ product_description: "", units: 1, weight: 0.1 })
              }
            >
              <Plus className="size-4 mr-1.5" /> Agregar fila
            </Button>
          </div>

          {/* Cabecera de columnas del Grid */}
          <div className="grid grid-cols-[1fr_120px_140px_48px] gap-2 pl-4 pr-6 py-1.5 border-b border-border/60 bg-muted/10">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-left">
              Producto
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">
              Unidades
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">
              Peso (KG)
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">
              Acciones
            </span>
          </div>

          <ScrollArea
            className={cn(
              "pr-2",
              fields.length > 5 ? "h-[320px]" : "h-auto max-h-[320px]",
            )}
          >
            <div className="space-y-0">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_120px_140px_48px] gap-2 items-center px-4 py-2 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  {/* Descripción */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.product_description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Ej. BOLSA CON GRIFO"
                            className="bg-transparent h-8 text-sm focus-visible:bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Unidades */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.units`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="bg-transparent h-8 text-sm text-center tabular-nums focus-visible:bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Peso */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.weight`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="bg-transparent h-8 text-sm text-center tabular-nums focus-visible:bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-right" />
                      </FormItem>
                    )}
                  />

                  {/* Eliminar Fila */}
                  <div className="flex justify-end items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className={cn(
                        "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity",
                        fields.length === 1 &&
                          "opacity-30 group-hover:opacity-30 cursor-not-allowed",
                      )}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Fila de Totales */}
          <div className="grid grid-cols-[1fr_120px_140px_48px] gap-2 items-center pl-4 pr-6 py-2 border-t-2 border-border/60 bg-muted/20 rounded-b-xl">
            <div className="text-right text-sm font-extrabold tracking-widest text-muted-foreground pr-4">
              TOTAL
            </div>
            <div className="text-center font-bold text-sm bg-background py-1.5 rounded-md border border-border/50 shadow-sm text-primary">
              {totalUnits}
            </div>
            <div className="text-center font-bold text-sm bg-background py-1.5 rounded-md border border-border/50 shadow-sm text-primary tabular-nums">
              {totalWeight.toLocaleString("es-VE", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
            </div>
            <div></div>
          </div>
        </div>

        <Button
          disabled={isPending}
          type="submit"
          className="w-full text-sm font-semibold h-11 cursor-pointer"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Actualizar Carga" : "Registrar Carga"}
        </Button>
      </form>
    </Form>
  );
}
