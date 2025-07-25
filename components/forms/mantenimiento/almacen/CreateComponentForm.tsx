'use client'

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useConfirmIncomingArticle, useCreateArticle } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGetConditions } from "@/hooks/administracion/useGetConditions"
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers"
import { useGetArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByCategory"
import { useGetBatchesByLocationId } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesByLocationId"
import { cn } from "@/lib/utils"
import loadingGif from '@/public/loading2.gif'
import { useCompanyStore } from "@/stores/CompanyStore"
import { Article, Batch } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { addYears, format, subYears } from "date-fns"
import { es } from 'date-fns/locale'
import { CalendarIcon, FileUpIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Textarea } from "../../../ui/textarea"
import { MultiInputField } from "../../../misc/MultiInputField"

interface EditingArticle extends Article {
  batches: Batch,
  component?: {
    serial: string,
    hard_time: {
      hour_date: string,
      cycle_date: string,
      calendary_date: string,
    },
    shell_time: {
      caducate_date: string,
      fabrication_date: string,
    }
  },
}

const CreateComponentForm = ({ initialData, isEditing }: {
  initialData?: EditingArticle,
  isEditing?: boolean,
}) => {

  const [filteredBatches, setFilteredBatches] = useState<Batch[]>()

  const [fabricationDate, setFabricationDate] = useState<Date>()

  const [caducateDate, setCaducateDate] = useState<Date>()

  const [calendarDate, setCalendarDate] = useState<Date>()

  const { createArticle } = useCreateArticle();

  const { selectedStation, selectedCompany } = useCompanyStore();

  const { confirmIncoming } = useConfirmIncomingArticle();

  const router = useRouter();

  const { mutate, data: batches, isPending: isBatchesLoading, isError } = useGetBatchesByLocationId();

  const { data: manufacturers, isLoading: isManufacturerLoading, isError: isManufacturerError } = useGetManufacturers(selectedCompany?.slug)

  const { data: conditions, isLoading: isConditionsLoading, error: isConditionsError } = useGetConditions();

  const { mutate: verifyMutation, data: components } = useGetArticlesByCategory(Number(selectedStation), "componente")

  const formSchema = z.object({
    article_type: z.string().optional(),
    serial: z.string().min(2, {
      message: "El serial debe contener al menos 2 carácteres.",
    }).optional(),
    part_number: z.string().min(2, {
      message: "El número de parte debe contener al menos 2 caracteres.",
    }).refine((value) => {
      // Verificar si el valor del número de parte existe en los componentes
      const existsAsAlternate = components?.some(
        (component) => component.alternative_part_number === value
      );
      return !existsAsAlternate;
    }, {
      message: "Este número de parte ya existe como número de parte alternativo en otro componente.",
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
    caducate_date: z.date().optional(),
    fabrication_date: z.date().optional(),
    cost: z.string().optional(),
    calendar_date: z.date().optional(),
    hour_date: z.coerce.number({
      required_error: "Ingrese las horas máximas.",
    }).optional(),
    cycle_date: z.coerce.number({
      required_error: "Ingrese los ciclos máximos.",
    }).optional(),
    manufacturer_id: z.string({
      message: "Debe ingresar una marca.",
    }).optional(),
    condition_id: z.string({
      message: "Debe ingresar la condición del articulo.",
    }).optional(),
    batches_id: z.string({
      message: "Debe ingresar un lote.",
    }),
    certificate_8130: z
      .instanceof(File, { message: 'Please upload a file.' })
      .refine((f) => f.size < 10000_000, 'Max 100Kb upload size.').optional(),

    certificate_fabricant: z
      .instanceof(File, { message: 'Please upload a file.' })
      .refine((f) => f.size < 10000_000, 'Max 100Kb upload size.').optional(),

    certificate_vendor: z
      .instanceof(File, { message: 'Please upload a file.' })
      .refine((f) => f.size < 10000_000, 'Max 100Kb upload size.').optional(),
    image: z
      .instanceof(File).optional()
    ,
  })

  useEffect(() => {
    if (selectedStation) {
      mutate({location_id: Number(selectedStation), company: selectedCompany!.slug})
      verifyMutation()
    }
  }, [selectedStation, mutate, verifyMutation])



  useEffect(() => {
    if (batches) {
      // Filtrar los batches por categoría
      const filtered = batches.filter((batch) => batch.category === "COMPONENTE");
      setFilteredBatches(filtered);
    }
  }, [batches]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: initialData?.part_number || "",
      serial: initialData?.serial || "",
      alternative_part_number: initialData?.alternative_part_number || [],
      batches_id: initialData?.batches.id?.toString() || "",
      manufacturer_id: initialData?.manufacturer?.id.toString() || "",
      condition_id: initialData?.condition?.id.toString() || "",
      description: initialData?.description || "",
      zone: initialData?.zone || "",
      hour_date: initialData?.component && Number(initialData.component.hard_time.hour_date) || 0,
      cycle_date: initialData?.component && Number(initialData.component.hard_time.cycle_date) || 0,
    }
  })
  form.setValue("article_type", "componente");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formattedValues = {
      ...values,
      caducate_date: caducateDate && format(caducateDate, "yyyy-MM-dd"),
      fabrication_date: fabricationDate && format(fabricationDate, "yyyy-MM-dd"),
      calendar_date: calendarDate && format(calendarDate, "yyyy-MM-dd"),
      batches_id: Number(values.batches_id),
      cost: values.cost && parseFloat(values.cost) || initialData?.cost,
    }
    if (isEditing) {
      confirmIncoming.mutateAsync({
        values: {
          ...values,
          id: initialData?.id,
          caducate_date: caducateDate && format(caducateDate, "yyyy-MM-dd"),
          fabrication_date: fabricationDate && format(fabricationDate, "yyyy-MM-dd"),
          calendar_date: calendarDate && format(calendarDate, "yyyy-MM-dd"),
          batches_id: values.batches_id,
          status: "Stored"
        },
        company: selectedCompany!.slug
      })
      router.push(`/${selectedCompany?.slug}/almacen/ingreso/en_recepcion`)
    } else {
      createArticle.mutate({company: selectedCompany!.slug, data: {
        ...formattedValues
      }});
    }
  }
  return (
    <Form {...form}>
      <form className="flex flex-col gap-4 max-w-6xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-7xl flex flex-col lg:flex-row gap-2 justify-center items-center w-full">
          <FormField
            control={form.control}
            name="part_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nro. de Parte</FormLabel>
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
              <FormItem>
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
        </div>

        <div className="flex flex-row gap-12 justify-center max-w-6xl">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fabrication_date"
              render={({ field }) => (
                <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                  <FormLabel>Fecha de Fabricacion</FormLabel>
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
                            format(fabricationDate, "PPP", {
                              locale: es
                            })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value) =>
                          setFabricationDate(subYears(new Date(), parseInt(value)))
                        }
                      >
                        <SelectTrigger className="p-3">
                          <SelectValue placeholder="Seleccione una opcion..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Actual</SelectItem>
                          <SelectItem value="5">Ir 5 años atrás</SelectItem>
                          <SelectItem value="10">Ir 10 años atrás</SelectItem>
                          <SelectItem value="15">Ir 15 años atrás</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={fabricationDate} onSelect={setFabricationDate}
                        initialFocus
                        month={fabricationDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha de creación del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caducate_date"
              render={({ field }) => (
                <FormItem className="flex flex-col p-0 mt-2.5 w-full">
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
                            format(caducateDate, "PPP", {
                              locale: es
                            })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value) =>
                          setCaducateDate(addYears(new Date(), parseInt(value)))
                        }
                      >
                        <SelectTrigger className="p-3">
                          <SelectValue placeholder="Seleccione una opcion..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Actual</SelectItem>
                          <SelectItem value="5">5 años</SelectItem>
                          <SelectItem value="10">10 años</SelectItem>
                          <SelectItem value="15">15 años</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={caducateDate} onSelect={setCaducateDate}
                        initialFocus
                        month={caducateDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha límite del articulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calendar_date"
              render={({ field }) => (
                <FormItem className="flex flex-col p-0 mt-2.5 w-full">
                  <FormLabel>Fecha de Calendario</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !calendarDate && "text-muted-foreground"
                          )}
                        >
                          {calendarDate ? (
                            format(calendarDate, "PPP", {
                              locale: es
                            })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value) =>
                          setCalendarDate(subYears(new Date(), parseInt(value)))
                        }
                      >
                        <SelectTrigger className="p-3">
                          <SelectValue placeholder="Seleccione una opcion..." />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Actual</SelectItem>
                          <SelectItem value="5">Ir 5 años atrás</SelectItem>
                          <SelectItem value="10">Ir 10 años atrás</SelectItem>
                          <SelectItem value="15">Ir 15 años atrás</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        locale={es}
                        mode="single"
                        selected={calendarDate} onSelect={setCalendarDate}
                        initialFocus
                        month={calendarDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha límite del componente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hour_date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Límite de Horas</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="EJ: 25000, 50000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Horas límite del componente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cycle_date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Límite de Ciclos</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="EJ: 65000, 70000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ciclos límite del componente.
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
                  <Select value={field.value} disabled={isManufacturerLoading} onValueChange={field.onChange}>
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
              name="batches_id"
              render={({ field }) => (
                <FormItem className={cn("", isEditing ? "col-span-2" : "col-span-1")}>
                  <FormLabel>Lote del Articulo</FormLabel>
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
          </div>
          <div className="flex flex-col max-w-7xl w-1/2 space-y-3">
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
            <div className="flex flex-col lg:flex-row gap-2 items-center">
              <FormField
                control={form.control}
                name="certificate_8130"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>C. #<span className="text-primary font-bold">8130</span></FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                          placeholder="Subir archivo..."
                          onChange={(e) => form.setValue("certificate_8130", e.target.files![0])}
                        />
                      </div>
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
                    <FormLabel>C. del <span className="text-primary">Fabricante</span></FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer"
                          onChange={(e) => form.setValue("certificate_fabricant", e.target.files![0])}
                        />
                      </div>
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
                  <FormItem>
                    <FormLabel>C. del <span className="text-primary">Vendedor</span></FormLabel>
                    <FormControl>
                      <div className="relative h-10 w-full ">
                        <FileUpIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <Input
                          type="file"
                          className="pl-8 pr-3 py-2 text-md w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6E23DD] focus:border-transparent cursor-pointer" // Add additional styling as needed
                          onChange={(e) => form.setValue("certificate_vendor", e.target.files![0])}
                        />
                      </div>
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
        <div>
          <Button className="bg-primary text-white hover:bg-blue-900 disabled:bg-slate-50 disabled:border-dashed disabled:border-black" disabled={createArticle?.isPending || confirmIncoming.isPending} type="submit">
            {createArticle?.isPending || confirmIncoming.isPending ? <Image className="text-black" src={loadingGif} width={170} height={170} alt="Loading..." /> : <p>{isEditing ? "Confirmar Ingreso" : "Crear Articulo"}</p>}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default CreateComponentForm
