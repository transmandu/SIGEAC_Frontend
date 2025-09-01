"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useState } from "react";

import {
  useCreateObligatoryReport,
  useUpdateObligatoryReport,
} from "@/actions/sms/reporte_obligatorio/actions";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useGetAircraftAcronyms } from "@/hooks/aerolinea/aeronaves/useGetAircraftAcronyms";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ObligatoryReport } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface FormProps {
  isEditing?: boolean;
  initialData?: ObligatoryReport;
  onClose: () => void;
}

export function CreateObligatoryReportForm({
  onClose,
  isEditing,
  initialData,
}: FormProps) {
  const { user } = useAuth();

  const userRoles = user?.roles?.map((role) => role.name) || [];

  const shouldEnableField = userRoles.some((role) =>
    ["SUPERUSER", "ANALISTA_SMS", "JEFE_SMS"].includes(role)
  );

  const FormSchema = z
    .object({
      report_number: shouldEnableField
        ? z
            .string()
            .min(1, "El número de reporte es obligatorio")
            .refine((val) => !isNaN(Number(val)), {
              message: "El valor debe ser un número",
            })
        : z
            .string()
            .refine((val) => val === "" || !isNaN(Number(val)), {
              message: "El valor debe ser un número o estar vacío",
            })
            .optional(),
      incident_location: z
        .string()
        .min(3, {
          message: "El lugar de incidente debe tener al menos 3 caracteres",
        })
        .max(50, {
          message: "El lugar de incidente no debe exceder los 50 caracteres",
        }),
      description: z.string(),
      report_date: z
        .date()
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
      incident_date: z
        .date()
        .refine((val) => !isNaN(val.getTime()), { message: "Fecha inválida" }),
      incident_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:mm)",
      }),
      flight_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Formato de hora inválido (HH:mm)",
      }),
      pilot_id: z.string({
        required_error: "El piloto es requerido.",
      }),
      copilot_id: z.string({
        required_error: "El copiloto es requerido.",
      }),
      aircraft_id: z.string({
        required_error: "La aeronave es requerida.",
      }),
      flight_number: z.string(),
      flight_origin: z
        .string()
        .min(3, {
          message: "El origen del vuelo debe tener al menos 3 caracteres.",
        })
        .max(4, {
          message: "El origen del vuelo debe tener máximo 4 caracteres.",
        }),
      flight_destiny: z
        .string()
        .min(3, {
          message: "El destino del vuelo debe tener al menos 3 caracteres.",
        })
        .max(4, {
          message: "El destino del vuelo debe tener máximo 4 caracteres.",
        }),
      flight_alt_destiny: z
        .string()
        .min(3, {
          message:
            "El destino alterno de vuelo debe tener al menos 3 caracteres.",
        })
        .max(4, {
          message:
            "El destino alterno de vuelo debe tener máximo 4 caracteres.",
        }),
      incidents: z.array(z.string()).optional(),
      other_incidents: z.preprocess(
        (val) => (val === null || val === undefined ? "" : val),
        z.string().optional()
      ),
      image: z
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, "Max 10MB")
        .refine(
          (file) => ["image/jpeg", "image/png"].includes(file.type),
          "Solo JPEG/PNG"
        )
        .optional(),
      document: z
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, "Máximo 10MB")
        .refine(
          (file) => file.type === "application/pdf",
          "Solo se permiten archivos PDF"
        )
        .optional(),
    })
    .refine(
      (data) => {
        const hasIncidents = data.incidents && data.incidents.length > 0;
        const hasOtherIncidents = data.other_incidents?.trim() !== "";
        return hasIncidents || hasOtherIncidents;
      },
      {
        message: "Debe proporcionar al menos un incidente o descripción",
        path: ["incidents"],
      }
    );

  type FormSchemaType = z.infer<typeof FormSchema>;

  const { createObligatoryReport } = useCreateObligatoryReport();
  const { updateObligatoryReport } = useUpdateObligatoryReport();
  const router = useRouter();

  const [showOtherInput, setShowOtherInput] = useState(
    initialData?.other_incidents ? true : false
  );

  const [open, setOpen] = useState(false);

  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (initialData?.incidents) {
      try {
        return JSON.parse(initialData.incidents);
      } catch (error) {
        return []; // Devuelve un array vacío en caso de error de parseo
      }
    }
    return []; // Devuelve un array vacío si initialData?.incidents es null o undefined
  });

  // No estoy seguro si esto va aca lol
  const { selectedCompany } = useCompanyStore();
  const { data: pilots, isLoading: isLoadingPilots } = useGetPilots(
    selectedCompany?.slug
  );
  const { data: aircrafts, isLoading: isLoadingAircrafts } =
    useGetAircraftAcronyms(selectedCompany?.slug);

  const OPTIONS_LIST = [
    "La aereonave aterriza quedándose solo con el combustible de reserva o menos",
    "Incursion en pista o calle de rodaje ( RUNAWAY INCURSION-RI)",
    "Aproximacion no estabilizada por debajo de los 500 pies VRF o 1000 PIES IRF",
    "Despresurizacion",
    "Salida de pista - RUNAWAY INCURSION",
    "Derrame de combustible",
    "Error  de navegacion con desviacion significativa de la ruta",
    "Casi colision (RESOLUCION ACVSORY-RA)",
    "Despegue abortado(REJETED TAKE OFF-RTO)",
    "Falla de motor",
    "Tail Strike",
    "Impacto con aves",
    "Aterrizaje fuerte (HARD LANDING)",
    "Alerta de fuego o humo",
    "Wind Shear",
    "El avion es evacuado",
    "Fallo en los controles de vuelo",
    "Parametros de vuelo anormales",
  ];

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      report_number: initialData?.report_number,
      description: initialData?.description,
      incident_location: initialData?.incident_location,
      aircraft_id: initialData?.aircraft?.id.toString(),
      pilot_id: initialData?.pilot?.id.toString(),
      copilot_id: initialData?.copilot?.id.toString(),
      flight_alt_destiny: initialData?.flight_alt_destiny,
      flight_destiny: initialData?.flight_destiny,
      flight_number: initialData?.flight_number,
      flight_origin: initialData?.flight_origin,
      incidents: initialData?.incidents
        ? JSON.parse(initialData.incidents)
        : [],
      other_incidents: initialData?.other_incidents ?? "",
      report_date: initialData?.report_date
        ? new Date(initialData?.report_date)
        : new Date(),
      incident_date: initialData?.incident_date
        ? new Date(initialData?.incident_date)
        : new Date(),
      flight_time: initialData?.flight_time
        ? initialData.flight_time.substring(0, 5) // Extraemos solo HH:mm
        : "00:00",
      incident_time: initialData?.incident_time
        ? initialData.incident_time.substring(0, 5) // Extraemos solo HH:mm
        : "00:00",
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    if (isEditing && initialData && data.report_number) {
      const value = {
        company: selectedCompany!.slug,
        id: initialData.id.toString(),
        data: {
          image: data.image,
          document: data.document,
          status: initialData.status,
          danger_identification_id: initialData.danger_identification?.id,
          report_number: data.report_number,
          incident_location: data.incident_location,
          description: data.description,
          incident_date: data.incident_date,
          report_date: data.report_date,
          incident_time: `${data.incident_time}:00`, // Añadimos segundos para el backend
          flight_time: `${data.flight_time}:00`, // Añadimos segundos para el backend
          pilot_id: data.pilot_id,
          copilot_id: data.copilot_id,
          aircraft_id: data.aircraft_id,
          flight_number: data.flight_number,
          flight_origin: data.flight_origin,
          flight_destiny: data.flight_destiny,
          flight_alt_destiny: data.flight_alt_destiny,
          incidents: data.incidents,
          other_incidents: data.other_incidents,
        },
      };
      await updateObligatoryReport.mutateAsync(value);
    } else {
      const value = {
        report_number: data.report_number,
        incident_location: data.incident_location,
        description: data.description,
        incident_date: data.incident_date,
        report_date: data.report_date,
        incident_time: `${data.incident_time}:00`, // Añadimos segundos para el backend
        flight_time: `${data.flight_time}:00`, // Añadimos segundos para el backend
        pilot_id: data.pilot_id,
        copilot_id: data.copilot_id,
        aircraft_id: data.aircraft_id,
        flight_number: data.flight_number,
        flight_origin: data.flight_origin,
        flight_destiny: data.flight_destiny,
        flight_alt_destiny: data.flight_alt_destiny,
        incidents: data.incidents,
        other_incidents: data.other_incidents,
        image: data.image,
        document: data.document,
        status: shouldEnableField ? "ABIERTO" : "PROCESO",
      };

      try {
        const response = await createObligatoryReport.mutateAsync(value);
        if (shouldEnableField) {
          router.push(
            `/${selectedCompany?.slug}/sms/reportes/reportes_obligatorios/${response.obligatory_report_id}`
          );
        } else {
          router.push(`/${selectedCompany?.slug}/dashboard`);
        }
      } catch (error) {
        console.error("Error al crear reporte:", error);
      }
    }
    onClose();
  };

  const handleOtherCheckboxChange = (checked: boolean) => {
    setShowOtherInput(checked);
    if (!checked) {
      form.setValue("other_incidents", "");
    }
  };

  const handleOtherInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    form.setValue("other_incidents", event.target.value);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3"
      >
        <FormLabel className="text-lg text-center m-2">
          Reporte Obligatorio de suceso
        </FormLabel>

        <div className="flex gap-2 items-center justify-evenly">
          {shouldEnableField && (
            <FormField
              control={form.control}
              name="report_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codigo del Reporte</FormLabel>
                  <FormControl>
                    <Input placeholder="001" {...field} maxLength={4} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="incident_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lugar del Incidente</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} maxLength={50} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion del Suceso</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex gap-2 items-center justify-center">
          <FormField
            control={form.control}
            name="incident_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Incidente</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="report_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5 w-full">
                <FormLabel>Fecha de Reporte</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()} // Solo deshabilitar fechas futuras
                      initialFocus
                      fromYear={1980} // Año mínimo que se mostrará
                      toYear={new Date().getFullYear()} // Año máximo (actual)
                      captionLayout="dropdown-buttons" // Selectores de año/mes
                      components={{
                        Dropdown: (props) => (
                          <select
                            {...props}
                            className="bg-popover text-popover-foreground"
                          >
                            {props.children}
                          </select>
                        ),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="pilot_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Piloto</FormLabel>
                {isLoadingPilots ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin " />
                    <span className="text-sm">Cargando pilotos...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingPilots} // Deshabilitar durante carga
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Piloto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pilots?.map((pilot) => (
                        <SelectItem key={pilot.id} value={pilot.id.toString()}>
                          {pilot.employee.first_name} {pilot.employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="copilot_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Piloto</FormLabel>
                {isLoadingPilots ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    <span className="text-sm">Cargando pilotos...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingPilots} // Deshabilitar durante carga
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Copiloto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pilots?.map((pilot) => (
                        <SelectItem key={pilot.id} value={pilot.id.toString()}>
                          {pilot.employee.first_name} {pilot.employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 justify-center items-center">
          <FormField
            control={form.control}
            name="flight_time"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hora de vuelo</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    onChange={(e) => {
                      // Validamos que el formato sea correcto
                      if (
                        e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                      ) {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incident_time"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Hora del incidente</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    onChange={(e) => {
                      // Validamos que el formato sea correcto
                      if (
                        e.target.value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                      ) {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="aircraft_id"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Aeronave</FormLabel>
              {isLoadingAircrafts ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  <span className="text-sm">Cargando Aeronaves...</span>
                </div>
              ) : (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingAircrafts} // Deshabilitar durante carga
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Matricula de la Aeronave" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aircrafts?.map((aircraft) => (
                      <SelectItem
                        key={aircraft.id}
                        value={aircraft.id.toString()}
                      >
                        <p className="font-bold">
                          Matricula : {aircraft.acronym}{" "}
                        </p>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="flight_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Numero de vuelo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numero del vuelo"
                    {...field}
                    maxLength={6}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flight_origin"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Origen de vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="Salida del vuelo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-center items-center">
          <FormField
            control={form.control}
            name="flight_destiny"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Destino de vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="Destino del vuelo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flight_alt_destiny"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Destino alterno del vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="Destino alterno del vuelo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {!showOtherInput && (
          <FormField
            control={form.control}
            name="incidents"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="m-2">Incidentes:</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[300px] justify-between"
                      >
                        {selectedValues && selectedValues.length > 0 ? (
                          <p>({selectedValues.length}) seleccionados</p>
                        ) : (
                          "Seleccionar opciones..."
                        )}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar opciones..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron opciones.
                          </CommandEmpty>
                          <CommandGroup>
                            {OPTIONS_LIST.map((option) => (
                              <CommandItem
                                key={option}
                                value={option}
                                onSelect={(currentValue) => {
                                  const isSelected =
                                    selectedValues.includes(currentValue);
                                  const newValues = isSelected
                                    ? selectedValues.filter(
                                        (v) => v !== currentValue
                                      )
                                    : [...selectedValues, currentValue];

                                  setSelectedValues(newValues);
                                  field.onChange(
                                    newValues.length > 0 ? newValues : []
                                  ); // Actualizar el valor del campo de formulario
                                }}
                              >
                                {option}
                                {selectedValues && (
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedValues.includes(option)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="other_incidents" // Campo separado para "other_incidents"
          render={() => (
            <FormItem className="mt-4">
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={showOtherInput}
                    onCheckedChange={handleOtherCheckboxChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Otros incidentes
                </FormLabel>
              </FormItem>
              {showOtherInput && (
                <FormItem className="mt-2">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Detalles del incidente"
                      {...form.register("other_incidents")}
                      onChange={handleOtherInputChange}
                    />
                  </FormControl>
                </FormItem>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center items-center gap-2">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen General</FormLabel>

                <div className="flex items-center gap-4">
                  {field.value ? (
                    <div className="relative h-16 w-16">
                      <Image
                        src={URL.createObjectURL(field.value)}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain"
                      />
                    </div>
                  ) : initialData?.image &&
                    typeof initialData.image === "string" ? (
                    <div className="relative h-16 w-16">
                      <Image
                        src={
                          initialData.image.startsWith("data:image")
                            ? initialData.image
                            : `data:image/jpeg;base64,${initialData.image}`
                        }
                        alt="Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain"
                      />
                    </div>
                  ) : null}

                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento PDF</FormLabel>
                <div className="flex items-center gap-4">
                  {field.value && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Archivo seleccionado:
                      </p>
                      <p className="font-semibold text-sm">
                        {field.value.name}
                      </p>
                    </div>
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button type="submit">Enviar reporte</Button>
      </form>
    </Form>
  );
}
