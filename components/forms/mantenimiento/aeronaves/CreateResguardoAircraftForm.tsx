'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useGetClients } from "@/hooks/general/clientes/useGetClients"
import { useCreateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import axiosInstance from "@/lib/axios"

const formSchema = z.object({
  acronym: z.string().min(2, "La matrícula debe tener al menos 2 caracteres"),
  client_id: z.string().min(1, "Debe seleccionar una empresa"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateResguardoAircraftFormProps {
  onClose: () => void
  onSuccess?: (aircraftId: string) => void
}

export function CreateResguardoAircraftForm({ 
  onClose, 
  onSuccess 
}: CreateResguardoAircraftFormProps) {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const queryClient = useQueryClient()
  const { data: clients, isLoading: isClientsLoading } = useGetClients(selectedCompany?.slug)
  const { createMaintenanceAircraft } = useCreateMaintenanceAircraft()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acronym: "",
      client_id: "",
    },
    mode: "onSubmit", // Solo validar cuando se intenta enviar
    reValidateMode: "onChange", // Después del primer submit, validar en cada cambio
  })

  const clientId = form.watch("client_id")

  const onSubmit = async (values: FormValues) => {
    if (!selectedCompany?.slug) return

    try {
      await createMaintenanceAircraft.mutateAsync({
        data: {
          aircraft: {
            manufacturer_id: "", // Default - ajustar según necesidad
            client_id: values.client_id,
            serial: "",
            model: "",
            acronym: values.acronym.toUpperCase(),
            flight_hours: 0,
            flight_cycles: 0,
            fabricant_date: new Date(),
            comments: "Aeronave de resguardo",
            location_id: selectedStation || "1",
            type: "SHELTER", // Tipo de aeronave: resguardo
          },
          parts: [],
        },
        company: selectedCompany.slug,
      })

      // Refresh aircrafts and get the new one
      await queryClient.invalidateQueries({ queryKey: ["aircrafts"] })
      
      const { data: updatedAircrafts } = await queryClient.fetchQuery({
        queryKey: ["aircrafts", selectedCompany.slug],
        queryFn: async () => {
          const { data } = await axiosInstance.get(`/${selectedCompany.slug}/aircrafts`)
          return data
        },
      })

      const newAircraft = updatedAircrafts?.find(
        (a: any) => a.acronym?.toUpperCase() === values.acronym.toUpperCase()
      )

      if (newAircraft && onSuccess) {
        onSuccess(newAircraft.id.toString())
      }

      toast.success("Aeronave creada", {
        description: "La aeronave ha sido registrada correctamente.",
      })
    } catch (error) {
      console.error("Error creating aircraft:", error)
      toast.error("Error", {
        description: "No se pudo crear la aeronave.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="acronym"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: YV1234"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Empresa</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={isClientsLoading}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {isClientsLoading ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : clientId ? (
                        clients?.find((c) => c.id.toString() === clientId)?.name
                      ) : (
                        "Seleccione empresa..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar empresa..." />
                    <CommandList>
                      <CommandEmpty>No se encontró la empresa.</CommandEmpty>
                      <CommandGroup>
                        {clients?.map((client) => (
                          <CommandItem
                            value={client.name}
                            key={client.id}
                            onSelect={() => {
                              form.setValue("client_id", client.id.toString())
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                `${client.id}` === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
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
              <FormDescription>
                Empresa a la que pertenece la aeronave.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMaintenanceAircraft.isPending}
          >
            {createMaintenanceAircraft.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear aeronave"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

