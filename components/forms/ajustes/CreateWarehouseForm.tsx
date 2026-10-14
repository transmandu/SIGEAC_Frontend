"use client"

import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  useCreateWarehouse,
  useUpdateWarehouse,
} from "@/actions/mantenimiento/almacen/almacenes/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany"
import { zodResolver } from "@/lib/zod-resolver"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Warehouse } from "@/types"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(50),
  location_id: z.string().min(1, "Debe seleccionar una ubicación."),
})

interface FormProps {
  onClose?: () => void
  /** Con almacén, el formulario edita en lugar de crear. */
  warehouse?: Warehouse
}

const CreateWarehouseForm = ({ onClose, warehouse }: FormProps) => {
  const { selectedCompany } = useCompanyStore()
  const { data: locations, isLoading: loadingLocations } =
    useGetLocationsByCompany(selectedCompany?.slug)
  const { createWarehouse } = useCreateWarehouse()
  const { updateWarehouse } = useUpdateWarehouse()
  const mutation = warehouse ? updateWarehouse : createWarehouse

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: warehouse?.name ?? "",
      location_id: warehouse?.location?.id ? String(warehouse.location.id) : "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = { name: values.name, location_id: Number(values.location_id) }

    try {
      if (warehouse) {
        await updateWarehouse.mutateAsync({
          company: selectedCompany!.slug,
          id: warehouse.id,
          data,
        })
      } else {
        await createWarehouse.mutateAsync({ company: selectedCompany!.slug, data })
      }
      onClose?.()
    } catch {
      // El aviso lo muestra la mutación; el formulario queda abierto.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.stopPropagation(); form.handleSubmit(onSubmit)(e) }} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del almacén</FormLabel>
              <FormControl>
                <Input placeholder="EJ: A-001" {...field} />
              </FormControl>
              <FormDescription>Este será el nombre de su almacén.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingLocations}>
                    <SelectValue placeholder={loadingLocations ? "Cargando..." : "Seleccione una ubicación..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.cod_iata} - {location.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Sede en la que se encuentra el almacén.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={mutation.isPending} type="submit">
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>{warehouse ? "Actualizar" : "Crear Almacén"}</p>}
        </Button>
      </form>
    </Form>
  )
}

export default CreateWarehouseForm
