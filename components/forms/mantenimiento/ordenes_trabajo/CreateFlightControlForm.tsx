'use client';
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
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../../../ui/calendar";
import { useCreateFlightControl, useUpdateFlightControl } from "@/actions/mantenimiento/planificacion/vuelos/actions";
import { useCompanyStore } from "@/stores/CompanyStore";


const formSchema = z.object({
  flight_number: z.string(),
  aircraft_operator: z.string(),
  origin: z.string(),
  destination: z.string(),
  flight_date: z.date(),
  flight_hours: z.coerce.number(),
  flight_cycles: z.coerce.number(),
  aircraft_id: z.string(),
})


interface FlightData {
  id: string,
  flight_number: string,
  aircraft_operator: string,
  origin: string,
  destination: string,
  flight_date: string | Date,
  flight_hours: number,
  flight_cycles: number,
  aircraft_id: string,
}

interface FormProps {
  onClose: () => void,
  flightData?: FlightData,
}

export default function CreateFlightControlForm({ onClose, flightData }: FormProps) {
  const { createFlightControl } = useCreateFlightControl()
  const { updateFlightControl } = useUpdateFlightControl()
  const { selectedCompany } = useCompanyStore()
  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts(selectedCompany?.slug)
  
  const isEditMode = !!flightData
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: flightData ? {
      flight_cycles: flightData.flight_cycles,
      flight_hours: flightData.flight_hours,
      flight_number: flightData.flight_number,
      origin: flightData.origin,
      destination: flightData.destination,
      aircraft_operator: flightData.aircraft_operator,
      aircraft_id: flightData.aircraft_id.toString(),
      flight_date: typeof flightData.flight_date === 'string' ? new Date(flightData.flight_date) : flightData.flight_date,
    } : {
      flight_cycles: 0,
      flight_hours: 0,
      flight_number: "",
      origin: "",
      destination: "",
      aircraft_operator: "",
    },
  })
  const { control } = form;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isEditMode) {
      await updateFlightControl.mutateAsync({
        id: flightData.id,
        data: values,
        company: selectedCompany!.slug
      })
    } else {
      await createFlightControl.mutateAsync({
        data: values,
        company: selectedCompany!.slug
      })
    }
    onClose()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        disabled={isAircraftsLoading || isAircraftsError || isEditMode}
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
                        <CommandEmpty className="text-sm p-2 text-center">No se ha encontrado ningún fabricante.</CommandEmpty>
                        <CommandGroup>
                          {aircrafts?.map((aircraft) => (
                            <CommandItem
                              value={`${aircraft.id}`}
                              key={aircraft.id}
                              onSelect={() => {
                                form.setValue("aircraft_id", aircraft.id.toString())
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
                  Aeronave que realizó el vuelo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="flight_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nro. de Vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: PZOCS199" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Número identificador del vuelo.
                </FormDescription>
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
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
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
                      disabled={(date: Date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  F. en la que el vuelo se realizó.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salida</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: PZO, CCS, etc..." {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Salida del vuelo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: POR, CCS, etc..." {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Destino final del vuelo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="aircraft_operator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piloto</FormLabel>
                <FormControl>
                  <Input placeholder="..." {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Piloto que realizó el vuelo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 items-center justify-center mt-4">
          <FormField
            control={control}
            name="flight_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas de Vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 5" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Horas voladas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="flight_cycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciclos de Vuelo</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 5" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Ciclos realizados.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70 " disabled={createFlightControl?.isPending || updateFlightControl?.isPending} type="submit">
          {(createFlightControl?.isPending || updateFlightControl?.isPending) ? <Loader2 className="size-4 animate-spin" /> : <p>{isEditMode ? 'Actualizar Vuelo' : 'Crear Vuelo'}</p>}
        </Button>
      </form>
    </Form>
  )
}
