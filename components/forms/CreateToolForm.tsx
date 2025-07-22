'use client'

import { useConfirmIncomingArticle, useCreateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
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
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { conditions } from "@/lib/conditions"
import loadingGif from '@/public/loading2.gif'
import { useCompanyStore } from "@/stores/CompanyStore"
import { Article, Batch, ToolArticle } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileUpIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Checkbox } from "../ui/checkbox"
import { Textarea } from "../ui/textarea"
import { AmountInput } from "../misc/AmountInput"
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers"
import { useGetConditions } from "@/hooks/administracion/useGetConditions"
import { useRouter } from "next/navigation"
import { MultiInputField } from "./MultiInputField"

const formSchema = z.object({
  article_type: z.string(),
  serial: z.string().min(2, {
    message: "El serial debe contener al menos 2 carácteres.",
  }),
  part_number: z.string().min(2, {
    message: "El serial debe contener al menos 2 carácteres.",
  }),
  alternative_part_number: z.array(
    z.string().min(2, {
      message: "Cada número de parte alterno debe contener al menos 2 carácteres.",
    })
  ).optional(),
  description: z.string({
    message: "Debe ingresar la descripción del articulo."
  }).min(2, {
    message: "La descripción debe contener al menos 2 carácteres.",
  }),
  zone: z.string({
    message: "Debe ingresar la ubicación del articulo.",
  }),
  manufacturer_id: z.string({
    message: "Debe ingresar un fabricante.",
  }),
  condition_id: z.string(),
  cost: z.string(),
  batches_id: z.string({
    message: "Debe ingresar un lote.",
  }),
  is_special: z.boolean(),
  certificate_8130: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 1000000_000, 'Max 100Kb upload size.').optional(),
  certificate_fabricant: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 1000000_000, 'Max 100Kb upload size.').optional(),

  certificate_vendor: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 1000000_000, 'Max 100Kb upload size.').optional(),
  image: z
    .instanceof(File, { message: 'Please upload a file.' })
    .refine((f) => f.size < 1000000_000, 'Max 100Kb upload size.').optional(),
})


interface EditingArticle extends Article {
  batches: Batch,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
}


const CreateToolForm = ({ initialData, isEditing }: {
  initialData?: EditingArticle,
  isEditing?: boolean,
}) => {

  const [filteredBatches, setFilteredBatches] = useState<Batch[]>()

  const { createArticle } = useCreateArticle();

  const { confirmIncoming } = useConfirmIncomingArticle();

  const { selectedStation, selectedCompany } = useCompanyStore();

  const router = useRouter()

  const { mutate, data: batches, isPending: isBatchesLoading, isError } = useGetBatchesByLocationId();

  const { data: conditions, isLoading: isConditionsLoading, error: isConditionsError } = useGetConditions();

  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } = useGetManufacturers(selectedCompany?.split(" ").join(""))

  useEffect(() => {
    if (selectedStation) {
      mutate(Number(selectedStation))
    }
  }, [selectedStation, mutate])

  useEffect(() => {
    if (batches) {
      // Filtrar los batches por categoría
      const filtered = batches.filter((batch) => batch.category === "HERRAMIENTA");
      setFilteredBatches(filtered);
    }
  }, [batches]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serial: initialData?.serial || "",
      part_number: initialData?.part_number || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batches_id: initialData?.batches.id?.toString() || "",
      manufacturer_id: initialData?.manufacturer?.id.toString() || "",
      condition_id: initialData?.condition?.id.toString() || "",
      description: initialData?.description || "",
      is_special: initialData?.tool?.isSpecial || false,
      zone: initialData?.zone || "",
      cost: initialData && initialData?.cost?.toString() || "",
    }
  })
  form.setValue("article_type", "herramienta");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      batches_id: Number(values.batches_id),
      cost: 0,
      status: "Stored",
    }
    if (isEditing) {
      confirmIncoming.mutate({
        ...values,
        id: initialData?.id,
        certificate_8130: values.certificate_8130 || initialData?.certifcate_8130,
        certificate_fabricant: values.certificate_fabricant || initialData?.certifcate_fabricant,
        certificate_vendor: values.certificate_vendor || initialData?.certifcate_vendor,
        status: "Stored"
      })
      router.push("/hangar74/almacen/ingreso/en_recepcion")
    } else {
      createArticle.mutate(formattedValues);
    }
  }

  console.log(form.watch("image"))
  return (
    <Form {...form}>
      <form encType="multipart/form-data" className="flex flex-col gap-4 max-w-6xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-7xl grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col xl:flex-row gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem className="w-full xl:w-1/3 min-w-0">
                  <FormLabel>Numero de Parte</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: 234ABAC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alternative_part_number"
              render={({ field }) => (
                <FormItem className="w-full xl:w-2/3 min-w-0">
                  <FormLabel>Nro. de Parte Alternos</FormLabel>
                  <FormControl>
                    <MultiInputField
                      values={field.value || []}
                      onChange={field.onChange}
                      placeholder="EJ: 234ABAC"
                    />
                  </FormControl>
                  <FormDescription>
                    Identificadores alternativos del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Serial</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 234ABAC" {...field} />
                </FormControl>
                <FormDescription>
                  Identificador único del articulo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Fabricante</FormLabel>
                <Select disabled={isManufacturerLoading} onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      manufacturers && manufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>{manufacturer.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormDescription>
                  Marca específica del articulo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-row gap-10 justify-between max-w-6xl">
          <div className="flex flex-col w-full">
            <FormField
              control={form.control}
              name="batches_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Renglón del Articulo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isBatchesLoading ? <Loader2 className="size-4 animate-spin" /> : "Seleccione lote..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {
                        filteredBatches && filteredBatches.map((batch) => (
                          <SelectItem key={batch.name} value={batch.id.toString()}>{batch.name} - {batch.warehouse_name}</SelectItem>
                        ))
                      }
                      {
                        !filteredBatches || filteredBatches?.length <= 0 && (
                          <p className="text-sm text-muted-foreground p-2 text-center">No se han encontrado lotes....</p>
                        )
                      }
                      {
                        isError && (
                          <p className="text-sm text-muted-foreground p-2 text-center">Ha ocurrido un error al cargar los lotes...</p>
                        )
                      }

                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Lote a asignar el articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Condición</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isConditionsLoading}>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {
                        conditions && conditions.map((condition) => (
                          <SelectItem key={condition.id} value={condition.id.toString()}>{condition.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Estado físico del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* {
              !isEditing && (
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Costo Total</FormLabel>
                      <FormControl>
                        <AmountInput placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        El costo final que tuvo el articulo.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )
            } */}
            {/* {
              isEditing && (
                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Zona de Ubicacion</FormLabel>
                      <FormControl>
                        <Input placeholder="EJ: Pasillo 4, etc..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Identificador único del articulo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            } */}
            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Zona de Ubicacion</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Pasillo 4, etc..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_special"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      ¿Es especial?
                    </FormLabel>
                    <FormDescription>
                      El articulo tiene un uso especial o único.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col max-w-7xl space-y-3 w-full">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>Descripción del Articulo</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="EJ: Motor V8 de..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Breve descricion del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imágen del Articulo</FormLabel>
                  {
                    initialData && <Image src={`data:image/png;base64,${initialData.image!.toString()}`} width={100} height={100} alt="Imagen defecto" />
                  }
                  <FormControl>
                    <div className="relative h-10 w-full ">
                      <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                      <Input
                        type="file"
                        onChange={(e) => form.setValue("image", e.target.files![0])}
                        className="pl-10 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Imágen descriptiva del articulo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2 items-center">
              <FormField
                control={form.control}
                name="certificate_8130"
                render={({ field }) => (
                  <FormItem className="w-full flex flex-col">
                    <FormLabel>Certificado #<span className="text-primary font-bold">8130</span></FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        onChange={(e) => form.setValue("certificate_8130", e.target.files![0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Documento legal del archivo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_fabricant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado del <span className="text-primary">Fabricante</span></FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        onChange={(e) => form.setValue("certificate_fabricant", e.target.files![0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Documentos legal del articulo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_vendor"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Certificado del <span className="text-primary">Vendedor</span></FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        onChange={(e) => form.setValue("certificate_vendor", e.target.files![0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Documentos legal del articulo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end w-full">
          <Button className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-dashed disabled:border-black" disabled={createArticle?.isPending || confirmIncoming.isPending} type="submit">
            {createArticle?.isPending || confirmIncoming.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>{isEditing ? "Confirmar Ingreso" : "Crear Articulo"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CreateToolForm
