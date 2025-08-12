"use client"

import { useCreatePlanificationEvent } from "@/actions/mantenimiento/planificacion/eventos/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  description: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  priority: z.string(),
  aircraft_id: z.string(),
})

const CreatePlanificationEventForm = ({
  date,
  onClose,
}: {
  date?: string,
  onClose: (open: boolean) => void
}) => {
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null)
  const {selectedCompany, selectedStation} = useCompanyStore()
  const {createPlanificationEvent} = useCreatePlanificationEvent()
  const { data: aircrafts, isLoading: isAircraftsLoading, isError: isAircraftsError } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: date,
      end_date: "",
    },
  })

  const formatDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':')
    date.setHours(parseInt(hours))
    date.setMinutes(parseInt(minutes))
    return format(date, "yyyy-MM-dd HH:mm")
  }

   async function onSubmit(values: z.infer<typeof formSchema>) {
    await createPlanificationEvent.mutateAsync({
        company: selectedCompany!.slug,
        data:{
          ...values,
           location_id: selectedStation!,
        }})
        onClose(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el título del evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prioridad y Aeronave */}
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="aircraft_id"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-3 mt-1.5 w-full">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la prioridad..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="LOW">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Ingrese la descripción del evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha y Hora de Inicio */}
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha y Hora de Inicio</FormLabel>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", {locale: es})
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentValue = field.value ? new Date(field.value) : new Date()
                          const timePart = field.value ? format(currentValue, "HH:mm") : "00:00"
                          const newDateTime = formatDateTime(date, timePart)
                          field.onChange(newDateTime)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormControl>
                  <Input
                    type="time"
                    step="60"
                    onChange={(e) => {
                      const time = e.target.value
                      if (time && field.value) {
                        const date = new Date(field.value)
                        const newDateTime = formatDateTime(date, time)
                        field.onChange(newDateTime)
                      } else if (time) {
                        // Si no hay fecha pero sí hora, usamos hoy como fecha
                        const newDateTime = formatDateTime(new Date(), time)
                        field.onChange(newDateTime)
                      }
                    }}
                    value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha y Hora de Fin */}
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha y Hora de Fin</FormLabel>
              <div className="flex gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", {locale: es})
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentValue = field.value ? new Date(field.value) : new Date()
                          const timePart = field.value ? format(currentValue, "HH:mm") : "00:00"
                          const newDateTime = formatDateTime(date, timePart)
                          field.onChange(newDateTime)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormControl>
                  <Input
                    type="time"
                    step="60"
                    onChange={(e) => {
                      const time = e.target.value
                      if (time && field.value) {
                        const date = new Date(field.value)
                        const newDateTime = formatDateTime(date, time)
                        field.onChange(newDateTime)
                      } else if (time) {
                        // Si no hay fecha pero sí hora, usamos hoy como fecha
                        const newDateTime = formatDateTime(new Date(), time)
                        field.onChange(newDateTime)
                      }
                    }}
                    value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Crear Evento</Button>
      </form>
    </Form>
  )
}

export default CreatePlanificationEventForm
