"use client"
import { useCreateRequisition, useUpdateRequisition } from "@/actions/mantenimiento/compras/requisiciones/actions"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts'
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2, MinusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { ScrollArea } from "../../../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Separator } from "../../../ui/separator"
import { Textarea } from "../../../ui/textarea"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { useGetArticlesByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByCategory"

const FormSchema = z.object({
  justification: z.string().min(2, "La justificación debe ser válida"),
  company: z.string(),
  location_id: z.string(),
  type: z.string({ message: "Debe seleccionar un tipo de requisición." }),
  aircraft_id: z.string().optional(),
  created_by: z.string(),
  requested_by: z.string({ message: "Debe ingresar quien lo solicita." }),
  articles: z
    .array(
      z.object({
        batch: z.string(),
        batch_name: z.string(),
        category: z.string(),
        batch_articles: z.array(
          z.object({
            part_number: z.string().min(1, "El número de parte es obligatorio"),
            alt_part_number: z.string().optional(),
            quantity: z.number().min(1, "Debe ingresar una cantidad válida"),
            unit: z.string().optional(),
          })
        ),
      })
    ),
}).refine((data) => {
  if (data.type === "AERONAUTICO" && !data.aircraft_id) return false
  return true
}, { message: "Debe seleccionar una aeronave.", path: ["aircraft_id"] })

type FormSchemaType = z.infer<typeof FormSchema>


interface IArticleByCategory {
  id: string | number;
  part_number: string;
  alt_part_number?: string;
  description?: string;
  batches_id: string;
  batch_name?: string;
  category?: string;
}

interface Article {
  part_number: string
  alt_part_number?: string
  quantity: number
  unit?: string
  batches_id: string
  batch_name: string
  category: string
}

interface Batch {
  batch: string
  batch_name: string
  category: string
  batch_articles: Article[]
}

interface FormProps {
  onClose: () => void
  initialData?: FormSchemaType
  id?: number | string
  isEditing?: boolean
}

export function CreateGeneralArticleRequisitionForm({ onClose, initialData, isEditing, id }: FormProps) {
  const { user } = useAuth()
  const { selectedCompany, selectedStation } = useCompanyStore()
  const { data: employees, isPending: employeesLoading } = useGetUserDepartamentEmployees(selectedCompany?.slug)
  const { data: units, isLoading: isUnitsLoading } = useGetUnits(selectedCompany?.slug)
  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug)

  // Traemos todos los artículos (null category) y con location_id y company
    const { data: articlesByCategory } = useGetArticlesByCategory(
    selectedStation ? Number(selectedStation) : 0,
    "",
    selectedCompany?.slug
    )


  const { createRequisition } = useCreateRequisition()
  const { updateRequisition } = useUpdateRequisition()

  const [selectedArticles, setSelectedArticles] = useState<Article[]>([])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { articles: [] },
  })

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString())
      form.setValue("company", selectedCompany.slug)
      form.setValue("location_id", selectedStation)
    }
    if (initialData) form.reset(initialData)
  }, [user, initialData, selectedCompany, selectedStation, form])

    const handleArticleSelect = (article: IArticleByCategory) => {
    setSelectedArticles((prev) => [
      ...prev,
      {
      part_number: article.part_number,
      alt_part_number: article.alt_part_number || "",
      quantity: 0, // inicializamos en 0
      unit: undefined,
      batches_id: article.batches_id?.toString(),
      batch_name: article.batch_name || "—", // si no tiene nombre
      category: article.category || "general", // si no tiene category
      }
    ])
    }

  const handleArticleChange = (index: number, field: string, value: any) => {
    setSelectedArticles((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    )
  }

  const removeArticle = (index: number) => {
    setSelectedArticles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatArticlesToBatches = (): Batch[] => {
    const batchMap = new Map<string, Batch>()
    selectedArticles.forEach((article) => {
      const batchId = article.batches_id
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batch: batchId,
          batch_name: article.batch_name,
          category: article.category,
          batch_articles: [],
        })
      }
      batchMap.get(batchId)!.batch_articles.push(article)
    })
    return Array.from(batchMap.values())
  }

  const onSubmit = async (data: FormSchemaType) => {
    const formattedData = { ...data, articles: formatArticlesToBatches() }
    if (isEditing) {
      await updateRequisition.mutateAsync({ id: id!, data: formattedData, company: selectedCompany!.slug })
    } else {
      await createRequisition.mutateAsync({ data: formattedData, company: selectedCompany!.slug })
    }
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-3 max-h-[90vh]">

        {/* Solicitante y tipo */}
        <div className="flex gap-2">
          <FormField control={form.control} name="requested_by" render={({ field }) => (
            <FormItem className="w-full flex flex-col">
              <FormLabel>Solicitante</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button disabled={employeesLoading} variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                      {employeesLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> :
                        employees?.find(e => `${e.dni}` === field.value)?.first_name || "Seleccione..." }
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50"/>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px]">
                  <Command>
                    <CommandInput placeholder="Buscar empleado..." />
                    <CommandList>
                      <CommandEmpty>No se encontró ningún empleado</CommandEmpty>
                      <CommandGroup>
                        {employees?.map(emp => (
                          <CommandItem key={emp.id} value={`${emp.dni}`} onSelect={() => form.setValue("requested_by", `${emp.dni}`)}>
                            <Check className={cn(`${emp.dni}` === field.value ? "opacity-100" : "opacity-0")} />
                            {emp.first_name} {emp.last_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage/>
            </FormItem>
          )}/>

          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Tipo de Req.</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="AERONAUTICO">Aeronáutico</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage/>
            </FormItem>
          )}/>
        </div>

        {/* Selector de artículos con batch */}
        <FormField control={form.control} name="articles" render={() => (
          <FormItem>
            <FormLabel>Artículos</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  Seleccione un artículo...
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
                <Command>
                  <CommandInput placeholder="Buscar artículo..." />
                  <CommandList>
                    <CommandEmpty>No hay artículos disponibles</CommandEmpty>
                    <CommandGroup>
                      {(articlesByCategory || []).filter(a => a.batches_id != null).map((a) => (
                        <CommandItem key={a.id} value={a.part_number} onSelect={() => handleArticleSelect({ ...a, batches_id: a.batches_id?.toString() })}>
                          <Check className={cn(selectedArticles.some(sa => sa.part_number === a.part_number) ? "opacity-100" : "opacity-0")} />
                          {a.part_number} - {a.description}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <ScrollArea className="mt-4 h-[250px] space-y-2">
              {selectedArticles.map((article, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input placeholder="Número de parte" value={article.part_number} onChange={(e) => handleArticleChange(index, "part_number", e.target.value)} />
                  <Input placeholder="Cantidad" type="number" min={0} value={article.quantity} onChange={(e) => handleArticleChange(index, "quantity", Number(e.target.value))} />
                  <Select value={article.unit} onValueChange={(v) => handleArticleChange(index, "unit", v)}>
                    <SelectTrigger><SelectValue placeholder="Unidad"/></SelectTrigger>
                    <SelectContent>{units?.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="ghost" type="button" onClick={() => removeArticle(index)}><MinusCircle className="h-4 w-4"/></Button>
                </div>
              ))}
            </ScrollArea>
          </FormItem>
        )}/>

        {/* Justificación */}
        <FormField control={form.control} name="justification" render={({ field }) => (
          <FormItem>
            <FormLabel>Justificación</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Ej: Necesidad de la pieza X..." />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}/>

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={createRequisition.isPending || updateRequisition.isPending}>
          {isEditing ? "Editar Requisición" : "Generar Requisición"}
          {(createRequisition.isPending || updateRequisition.isPending) && <Loader2 className="ml-2 h-4 w-4 animate-spin"/>}
        </Button>
      </form>
    </Form>
  )
}
