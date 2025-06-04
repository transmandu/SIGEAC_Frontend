"use client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateWarehouse } from "@/actions/mantenimiento/almacen/almacenes/actions"
import { Input } from "@/components/ui/input"
import { useGetCompaniesWithWarehouses } from "@/hooks/sistema/useGetCompaniesWithWarehouses"
import { useGetLocationsByCompanyId } from "@/hooks/sistema/useGetLocationsByCompanyId"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2).max(50),
  company_id: z.string({
    message: "Debe seleccionar una compañía."
  }),
  location_id: z.string({
    message: "Debe seleccionar una ubicación."
  }),
})


const CreateWarehouseForm = () => {

  const { data: companies, isLoading, error } = useGetCompaniesWithWarehouses();

  const { mutate: fetchLocations, data: locations, isPending } = useGetLocationsByCompanyId();

  const { createWarehouse } = useCreateWarehouse()

  const [companyId, setCompanyId] = useState<number>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location_id: "",
      company_id: "",
    },
  })

  useEffect(() => {
    if (companyId) {
      fetchLocations(companyId);
    }
  }, [companyId, fetchLocations]);

  const onCompanySelect = (value: string) => {
    setCompanyId(Number(value))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      company_id: Number(values.company_id),
      location_id: Number(values.location_id),
    }
    createWarehouse.mutate(formattedValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del almácen</FormLabel>
              <FormControl>
                <Input placeholder="EJ: A-001" {...field} />
              </FormControl>
              <FormDescription>
                Este será el nombre de su almácen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <Select onValueChange={(e) => {
                field.onChange(e)
                onCompanySelect(e)
              }}>
                <FormControl>
                  <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder={isLoading ? <Loader2 className="size-4 animate-spin" /> : "Seleccionar..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    companies && <SelectItem value={companies.company.id.toString()}>{companies.company.name}</SelectItem>
                  }
                </SelectContent>
              </Select>
              <FormDescription>
                Seleccione la ubicación en la cual se encuentrael almácen.
              </FormDescription>
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
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger disabled={!companyId || isPending}>
                    <SelectValue placeholder={isPending ? <Loader2 className="size-4 animate-spin" /> : "Seleccione una ubicacion..."} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    isPending ? <Loader2 className="size-4 animate-spin" />
                      :
                      locations && locations.map((location) => (
                        <SelectItem key={location.cod_iata} value={location.id.toString()}>{location.cod_iata} - {location.type}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
              <FormDescription>
                Seleccione la ubicación en la cual se encuentrael almácen.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createWarehouse?.isPending} type="submit">
          {createWarehouse?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear Almácen</p>}
        </Button>
      </form>
    </Form>
  )
}

export default CreateWarehouseForm
