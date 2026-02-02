'use client'

import { useEditArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useGetConditions } from "@/hooks/administracion/useGetConditions"
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers"
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Article, Batch, Convertion } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, addYears, subYears } from "date-fns"
import { es } from 'date-fns/locale'
import { CalendarIcon, FileUpIcon, Loader2, Save, Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MultiInputField } from "../../../misc/MultiInputField"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface EditingArticle extends Article {
  batches: Batch,
  tool?: {
    id: number,
    serial: string,
    isSpecial: boolean,
    article_id: number,
  }
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      expiration_date: string,
      fabrication_date: string,
    }
  },
  consumable?: {
    article_id: number,
    is_managed: boolean,
    convertions: Convertion[],
    quantity: number,
    min_quantity?: number,
    shell_time: {
      expiration_date: Date,
      fabrication_date: string,
      consumable_id: string,
    }
  },
}

const formSchema = z.object({
  part_number: z.string().min(2, {
    message: "El número de parte debe contener al menos 2 caracteres.",
  }),
  alternative_part_number: z
    .array(
      z.string().min(2, {
        message: "Cada número de parte alterno debe contener al menos 2 caracteres.",
      })
    )
    .optional(),
  description: z
    .string({
      message: "Debe ingresar la descripción del artículo.",
    })
    .min(2, {
      message: "La descripción debe contener al menos 2 caracteres.",
    }),
  zone: z.string({
    message: "Debe ingresar la ubicación del artículo.",
  }),
  manufacturer_id: z.string({
    message: "Debe seleccionar un fabricante.",
  }),
  condition_id: z.string({
    message: "Debe seleccionar una condición.",
  }),
  batches_id: z.string({
    message: "Debe seleccionar un lote.",
  }),
  fabrication_date: z.string().optional(),
  expiration_date: z.string().optional(),
  quantity: z.coerce.number().optional(),
  image: z.instanceof(File).optional(),
  certificate_8130: z.instanceof(File).optional(),
  certificate_fabricant: z.instanceof(File).optional(),
  certificate_vendor: z.instanceof(File).optional(),
})

interface EditArticleFormProps {
  initialData: EditingArticle
  onSuccess?: () => void
}

const EditArticleForm = ({ initialData, onSuccess }: EditArticleFormProps) => {
  const router = useRouter()
  const { selectedStation, selectedCompany } = useCompanyStore()

  const [fabricationDate, setFabricationDate] = useState<Date>()
  const [caducateDate, setCaducateDate] = useState<Date>()
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>()
  const [batchOpen, setBatchOpen] = useState(false)

  const { editArticle } = useEditArticle()

  const {
    data: manufacturers,
    isLoading: isManufacturerLoading,
    isError: isManufacturerError,
  } = useGetManufacturers(selectedCompany?.slug)

  const {
    data: conditions,
    isLoading: isConditionsLoading,
  } = useGetConditions()

  const {
    mutate,
    data: batches,
    isPending: isBatchesLoading,
  } = useGetBatchesByLocationId()

  useEffect(() => {
    if (selectedStation && selectedCompany) {
      mutate({
        location_id: Number(selectedStation),
        company: selectedCompany.slug
      })
    }
  }, [selectedStation, selectedCompany, mutate])

  useEffect(() => {
    if (batches) {
      const filtered = batches.filter(
        (batch) => batch.category === initialData.batches.category
      )
      setFilteredBatches(filtered)
    }
  }, [batches, initialData.batches.category])

  // Inicializar fechas desde los datos iniciales
  useEffect(() => {
    if (initialData.consumable?.shell_time.fabrication_date) {
      setFabricationDate(new Date(initialData.consumable.shell_time.fabrication_date))
    }
    if (initialData.consumable?.shell_time.expiration_date) {
      setCaducateDate(new Date(initialData.consumable.shell_time.expiration_date))
    }
  }, [initialData])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData.part_number || "",
      alternative_part_number: initialData.alternative_part_number || [],
      description: initialData.description || "",
      zone: initialData.zone || "",
      manufacturer_id: initialData.manufacturer?.id.toString() || "",
      condition_id: initialData.condition?.id.toString() || "",
      batches_id: initialData.batches.id.toString() || "",
      quantity: initialData.consumable?.quantity || initialData.quantity || 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!initialData.id) {
      console.error('No article ID found')
      return
    }

    const formattedValues = {
      ...values,
      id: initialData.id,
      fabrication_date: fabricationDate ? format(fabricationDate, "yyyy-MM-dd") : undefined,
      expiration_date: caducateDate ? format(caducateDate, "yyyy-MM-dd") : undefined,
      batches_id: Number(values.batches_id),
      manufacturer_id: Number(values.manufacturer_id),
      condition_id: Number(values.condition_id),
    }

    try {
      await editArticle.mutateAsync({
        data: formattedValues as any,
        company: selectedCompany!.slug
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${selectedCompany?.slug}/almacen/inventario_articulos`)
      }
    } catch (error) {
      console.error('Error editing article:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">Editar Artículo</h2>
        <p className="text-muted-foreground">
          Modifique los campos necesarios y guarde los cambios
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="part_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parte</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: 234ABAC" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="EJ: Pasillo 4, repisa 3..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Ubicación física del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="alternative_part_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Números de Parte Alternativos</FormLabel>
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="EJ: Motor V8 de..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Descripción detallada del artículo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isManufacturerLoading || isManufacturerError}
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {isManufacturerLoading && (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          )}
                          {field.value ? (
                            <p>
                              {
                                manufacturers?.find((m) => `${m.id}` === field.value)
                                  ?.name
                              }
                            </p>
                          ) : (
                            "Seleccione fabricante..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar fabricante..." />
                        <CommandList>
                          <CommandEmpty className="text-xs p-2 text-center">
                            No se encontró el fabricante.
                          </CommandEmpty>
                          <CommandGroup>
                            {manufacturers?.map((manufacturer) => (
                              <CommandItem
                                value={`${manufacturer.name}`}
                                key={manufacturer.id}
                                onSelect={() => {
                                  form.setValue(
                                    "manufacturer_id",
                                    manufacturer.id.toString(),
                                    { shouldValidate: true }
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    `${manufacturer.id}` === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <p>{manufacturer.name}</p>
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
              name="condition_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condición</FormLabel>
                  <Select
                    disabled={isConditionsLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditions &&
                        conditions.map((condition) => (
                          <SelectItem
                            key={condition.id}
                            value={condition.id.toString()}
                          >
                            {condition.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batches_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote</FormLabel>
                  <Popover open={batchOpen} onOpenChange={setBatchOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={batchOpen}
                          className={cn(
                            "w-full justify-between h-auto min-h-[2.5rem] py-2",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isBatchesLoading}
                        >
                          {isBatchesLoading ? (
                            <div className="flex items-center">
                              <Loader2 className="size-4 animate-spin mr-2" />
                              <span>Cargando lotes...</span>
                            </div>
                          ) : field.value ? (
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-medium truncate">
                                {filteredBatches?.find((batch) => batch.id.toString() === field.value)?.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {filteredBatches?.find((batch) => batch.id.toString() === field.value)?.warehouse_name}
                              </span>
                            </div>
                          ) : (
                            "Buscar lote..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar lote..." />
                        <CommandList>
                          <CommandEmpty>
                            No se han encontrado lotes...
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredBatches?.map((batch) => (
                              <CommandItem
                                key={batch.id}
                                value={`${batch.name} ${batch.warehouse_name}`}
                                onSelect={() => {
                                  form.setValue("batches_id", batch.id.toString());
                                  setBatchOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === batch.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{batch.name}</span>
                                  <span className="text-sm text-muted-foreground">{batch.warehouse_name}</span>
                                </div>
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
          </div>

          {/* Fechas (solo para consumibles) */}
          {initialData.batches.category === 'consumible' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fabrication_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fabricación</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !fabricationDate && "text-muted-foreground"
                            )}
                          >
                            {fabricationDate ? (
                              format(fabricationDate, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={es}
                          mode="single"
                          selected={fabricationDate}
                          onSelect={setFabricationDate}
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
                name="expiration_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Caducidad</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !caducateDate && "text-muted-foreground"
                            )}
                          >
                            {caducateDate ? (
                              format(caducateDate, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={es}
                          mode="single"
                          selected={caducateDate}
                          onSelect={setCaducateDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Cantidad (solo para consumibles) */}
          {initialData.batches.category === 'consumible' && (
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/3">
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="EJ: 10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cantidad disponible del artículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Archivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Archivos y Documentos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Artículo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) form.setValue("image", file)
                          }}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificate_8130"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado 8130</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) form.setValue("certificate_8130", file)
                          }}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={editArticle.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={editArticle.isPending}
              className="min-w-[120px]"
            >
              {editArticle.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default EditArticleForm
