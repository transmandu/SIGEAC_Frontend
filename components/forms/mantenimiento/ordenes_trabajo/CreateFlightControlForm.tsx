"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../../ui/calendar";
import {
  useCreateFlightControl,
  useUpdateFlightControl,
} from "@/actions/mantenimiento/planificacion/vuelos/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

const flightEntrySchema = z.object({
  flight_number: z.string().optional(),
  aircraft_operator: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  flight_date: z.date({ required_error: "Seleccione una fecha" }),
  flight_hours: z.coerce.number().min(0, "Debe ser ≥ 0"),
  flight_cycles: z.coerce.number().min(0, "Debe ser ≥ 0"),
});

const createFormSchema = z.object({
  aircraft_id: z.string().min(1, "Seleccione una aeronave"),
  flights: z.array(flightEntrySchema).min(1, "Agregue al menos un vuelo"),
});

const editFormSchema = z.object({
  flight_number: z.string().optional(),
  aircraft_operator: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  flight_date: z.date({ required_error: "Seleccione una fecha" }),
  flight_hours: z.coerce.number().min(0, "Debe ser ≥ 0"),
  flight_cycles: z.coerce.number().min(0, "Debe ser ≥ 0"),
  aircraft_id: z.string().min(1, "Seleccione una aeronave"),
});

interface FlightData {
  id: string;
  flight_number: string;
  aircraft_operator: string | null;
  origin: string | null;
  destination: string | null;
  flight_date: string | Date;
  flight_hours: number;
  flight_cycles: number;
  aircraft_id: string;
}

interface FormProps {
  onClose: () => void;
  flightData?: FlightData;
  deafultAircraftId?: string;
}

function AircraftSelect({
  control,
  name,
  disabled,
}: {
  control: any;
  name: string;
  disabled?: boolean;
}) {
  const { selectedCompany } = useCompanyStore();
  const {
    data: aircrafts,
    isLoading,
    isError,
  } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-3">
          <FormLabel>Aeronave</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={isLoading || isError || disabled}
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "justify-between",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {isLoading && (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  )}
                  {field.value ? (
                    <p>
                      {
                        aircrafts?.find(
                          (aircraft) =>
                            `${aircraft.id.toString()}` === field.value,
                        )?.acronym
                      }
                    </p>
                  ) : (
                    "Elige la aeronave..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Busque una aeronave..." />
                <CommandList>
                  <CommandEmpty className="text-sm p-2 text-center">
                    No se ha encontrado ninguna aeronave.
                  </CommandEmpty>
                  <CommandGroup>
                    {aircrafts?.map((aircraft) => (
                      <CommandItem
                        value={`${aircraft.id}`}
                        key={aircraft.id}
                        onSelect={() => {
                          field.onChange(aircraft.id.toString());
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            `${aircraft.id.toString()}` === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <p>{aircraft.acronym}</p>
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
  );
}

function DateField({ control, name }: { control: any; name: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-full justify-start text-left text-sm font-normal px-2",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    format(field.value, "dd/MM/yy", { locale: es })
                  ) : (
                    <span>Sel.</span>
                  )}
                  <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EditForm({
  flightData,
  onClose,
}: {
  flightData: FlightData;
  onClose: () => void;
}) {
  const { updateFlightControl } = useUpdateFlightControl();
  const { selectedCompany } = useCompanyStore();

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      flight_cycles: flightData.flight_cycles,
      flight_hours: flightData.flight_hours,
      flight_number: flightData.flight_number ?? "",
      origin: flightData.origin ?? "",
      destination: flightData.destination ?? "",
      aircraft_operator: flightData.aircraft_operator ?? "",
      aircraft_id: flightData.aircraft_id.toString(),
      flight_date:
        typeof flightData.flight_date === "string"
          ? new Date(flightData.flight_date)
          : flightData.flight_date,
    },
  });

  const onSubmit = async (values: z.infer<typeof editFormSchema>) => {
    await updateFlightControl.mutateAsync({
      id: flightData.id,
      data: values,
      company: selectedCompany!.slug,
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AircraftSelect control={form.control} name="aircraft_id" disabled />
          <FormField
            control={form.control}
            name="flight_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nro. de Vuelo{" "}
                  <span className="text-muted-foreground text-xs">(Opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="EJ: PZOCS199" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flight_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-2.5">
                <FormLabel>Fecha de Vuelo</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccione...</span>
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
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salida</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: PZO, CCS, etc..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: POR, CCS, etc..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aircraft_operator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piloto</FormLabel>
                <FormControl>
                  <Input placeholder="..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center mt-4">
          <FormField
            control={form.control}
            name="flight_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas de Vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="flight_cycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclos de Vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70"
          disabled={updateFlightControl?.isPending}
          type="submit"
        >
          {updateFlightControl?.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Actualizar Vuelo</p>
          )}
        </Button>
      </form>
    </Form>
  );
}

function CreateForm({
  deafultAircraftId,
  onClose,
}: {
  deafultAircraftId?: string;
  onClose: () => void;
}) {
  const { createFlightControl } = useCreateFlightControl();
  const { selectedCompany } = useCompanyStore();

  const form = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      aircraft_id: deafultAircraftId ?? "",
      flights: [
        {
          flight_cycles: "",
          flight_hours: "",
          flight_number: "",
          origin: "",
          destination: "",
          aircraft_operator: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "flights",
  });

  const onSubmit = async (values: z.infer<typeof createFormSchema>) => {
    const flightsData = values.flights.map((f) => ({
      ...f,
      aircraft_id: values.aircraft_id,
    }));
    await createFlightControl.mutateAsync({
      data: flightsData,
      company: selectedCompany!.slug,
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <AircraftSelect control={form.control} name="aircraft_id" />

        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Vuelos
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                flight_number: "",
                aircraft_operator: "",
                origin: "",
                destination: "",
                flight_hours: "",
                flight_cycles: "",
                flight_date: undefined as unknown as Date,
              })
            }
            className="h-7 gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            Agregar vuelo
          </Button>
        </div>

        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_80px_80px_28px] gap-3 px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Nro. Vuelo</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Fecha</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Salida</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Destino</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Piloto</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Horas</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Ciclos</span>
          <span />
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_80px_80px_28px] gap-3 items-start"
          >
            <FormField
              control={form.control}
              name={`flights.${index}.flight_number`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Opcional" className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DateField control={form.control} name={`flights.${index}.flight_date`} />
            <FormField
              control={form.control}
              name={`flights.${index}.origin`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="PZO" className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`flights.${index}.destination`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="CCS" className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`flights.${index}.aircraft_operator`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="..." className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`flights.${index}.flight_hours`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" min="0" step="0.1" placeholder="0" className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`flights.${index}.flight_cycles`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" min="0" step="1" placeholder="0" className="h-8 text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center pt-0.5">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {form.formState.errors.flights?.message && (
          <p className="text-xs text-destructive">
            {form.formState.errors.flights.message}
          </p>
        )}

        <Button
          className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70 w-full"
          disabled={createFlightControl?.isPending}
          type="submit"
        >
          {createFlightControl?.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <p>Crear Vuelos ({fields.length})</p>
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function CreateFlightControlForm({
  onClose,
  deafultAircraftId,
  flightData,
}: FormProps) {
  if (flightData) {
    return <EditForm flightData={flightData} onClose={onClose} />;
  }
  return <CreateForm deafultAircraftId={deafultAircraftId} onClose={onClose} />;
}
