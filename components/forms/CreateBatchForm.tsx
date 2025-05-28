"use client"

import { useCreateBatch } from "@/actions/almacen/inventario/lotes/actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetWarehousesByUser } from "@/hooks/administracion/useGetWarehousesByUser"
import { useGetBatchesWithArticlesCount } from "@/hooks/almacen/useGetBatchesWithArticleCount"
import { batches_categories } from "@/lib/batches_categories"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"
import { generateSlug } from "@/lib/utils"

const FormSchema = z.object({
  name: z.string().min(3, {
    message: "Debe introducir un nombre válido."
  }),
  description: z.string({
    message: "Debe introducir una descripcion válida."
  }),
  category: z.string({
    message: "Debe ingresar una categoria para el lote."
  }),
  alternative_part_number: z.string().optional(),
  ata_code: z.string().optional(),
  is_hazarous: z.boolean().optional(),
  medition_unit: z.string().optional(),
  min_quantity: z.string().optional(),
  warehouse_id: z.string(),
})

type FormSchemaType = z.infer<typeof FormSchema>

interface FormProps {
  onClose: () => void
}

export function CreateBatchForm({ onClose }: FormProps) {


  const { data: warehouses, error, isLoading } = useGetWarehousesByUser();

  const { createBatch } = useCreateBatch();

  const { selectedStation } = useCompanyStore();

  const { data: batches } = useGetBatchesWithArticlesCount(selectedStation ?? undefined);


  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      is_hazarous: false,
    },
  });

  const { control, setError, clearErrors } = form;

  const name = useWatch({ control, name: 'name' });

  useEffect(() => {
    const existingBatch = batches?.some(batch => batch.name === name);
    if (existingBatch) {
      setError("name", {
        type: "manual",
        message: "El numero de parte ya existe."
      });
    } else {
      clearErrors("name");
    }
  }, [name, batches, clearErrors, setError])


  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = {
      ...data,
      slug: generateSlug(data.name),
      min_quantity: Number(data.min_quantity),
      warehouse_id: Number(data.warehouse_id)
    }
    await createBatch.mutateAsync(formattedData);
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3 w-full">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-[240px]">
                <FormLabel>Categoria del Renglón</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={"Seleccione..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      batches_categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: Martillos " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ata_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código ATA</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: ABC123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-2 w-full">
            <FormField
              control={form.control}
              name="medition_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de medición</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Unidades" {...field} />
                  </FormControl>
                  <FormDescription>Unidad para medir el lote.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Mínima</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="EJ: 5" {...field} />
                  </FormControl>
                  <FormDescription>Cantidad mínima del lote.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 w-full">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="EJ: #### - ### - ###" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacén</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value} // Usa value en lugar de defaultValue
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? <Loader2 className="size-4 animate-spin" /> : "Seleccione..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading && <Loader2 className="size-4 animate-spin" />}
                      {warehouses && warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name} - {warehouse.location.address}
                        </SelectItem>
                      ))}
                      {warehouses && warehouses.length < 1 && (
                        <p className="text-xs p-2 text-muted-foreground">No se han encontrado almacenes...</p>
                      )}
                      {error && (
                        <p className="text-xs p-2 text-muted-foreground">Ha ocurrido un error al cargar los almacenes...</p>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="is_hazarous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  ¿El renglón contiene articulos peligrosos?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button className="bg-primary mt-2 text-white hover:bg-blue-900 disabled:bg-primary/70" disabled={createBatch?.isPending} type="submit">
          {createBatch?.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Crear</p>}
        </Button>
      </form>
    </Form>
  )
}
