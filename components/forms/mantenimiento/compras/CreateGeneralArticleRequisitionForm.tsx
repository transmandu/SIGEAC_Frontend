"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  useCreateRequisition,
  useUpdateRequisition,
} from "@/actions/mantenimiento/compras/requisiciones/actions"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { useGetUserDepartamentEmployees } from "@/hooks/sistema/empleados/useGetUserDepartamentEmployees"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import { useGetArticlesByCategory, IArticleByCategory } from "@/hooks/mantenimiento/almacen/articulos/useGetArticlesByCategory"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { cn } from "@/lib/utils"
import {
  Check,
  ChevronsUpDown,
  Loader2,
  MinusCircle,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                                   SCHEMA                                   */
/* -------------------------------------------------------------------------- */

const FormSchema = z
  .object({
    justification: z.string().min(2, "La justificación es obligatoria"),
    company: z.string(),
    location_id: z.string(),
    type: z.string(),
    aircraft_id: z.string().optional(),
    created_by: z.string(),
    requested_by: z.string(),
    image: z
      .instanceof(File)
      .refine((f) => f.size <= 5 * 1024 * 1024, "Máx 5MB")
      .refine(
        (f) => ["image/jpeg", "image/png"].includes(f.type),
        "Solo JPG o PNG"
      )
      .optional(),
    articles: z.array(
      z.object({
        batch: z.string(),
        batch_name: z.string(),
        category: z.string(),
        batch_articles: z.array(
          z.object({
            part_number: z.string().min(1),
            alt_part_number: z.string().optional(),
            quantity: z.number().min(1),
            unit: z.string().optional(),
            image: z.any().optional(),
          })
        ),
      })
    ),
  })
  .refine(
    (data) =>
      data.type !== "AERONAUTICO" || Boolean(data.aircraft_id),
    {
      message: "Debe seleccionar una aeronave",
      path: ["aircraft_id"],
    }
  )
  .refine(
    (data) =>
      data.articles.every((b) =>
        b.batch_articles.every(
          (a) => b.category !== "consumible" || !!a.unit
        )
      ),
    {
      message: "Unidad obligatoria para consumibles",
      path: ["articles"],
    }
  )

type FormSchemaType = z.infer<typeof FormSchema>

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

interface Article {
  part_number: string
  alt_part_number?: string
  quantity: number
  unit?: string
  image?: File
}

interface Batch {
  batch: string
  batch_name: string
  category: string
  batch_articles: Article[]
}

interface Props {
  onClose: () => void
  initialData?: FormSchemaType
  isEditing?: boolean
  id?: number | string
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function CreateGeneralArticleRequisitionForm({
  onClose,
  initialData,
  isEditing,
  id,
}: Props) {
  const { user } = useAuth()
  const { selectedCompany, selectedStation } = useCompanyStore()

  const { data: employees, isPending: employeesLoading } =
    useGetUserDepartamentEmployees(selectedCompany?.slug)

  const { data: units, isLoading: unitsLoading } =
    useGetUnits(selectedCompany?.slug)

  const { data: aircrafts, isLoading: aircraftsLoading } =
    useGetMaintenanceAircrafts(selectedCompany?.slug)

  const { createRequisition } = useCreateRequisition()
  const { updateRequisition } = useUpdateRequisition()

  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([])
  const [articleCategory, setArticleCategory] = useState("")
  const { data: articlesList, isLoading: articlesLoading, refetch: fetchArticles } = useGetArticlesByCategory(
    Number(selectedStation),
    articleCategory,
    selectedCompany?.slug
)

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      articles: [],
    },
  })


  /* ------------------------------- EFFECTS -------------------------------- */

  useEffect(() => {
    if (user && selectedCompany && selectedStation) {
      form.setValue("created_by", user.id.toString())
      form.setValue("company", selectedCompany.slug)
      form.setValue("location_id", selectedStation)
    }

    if (initialData) {
      form.reset(initialData)
    }
  }, [user, selectedCompany, selectedStation, initialData, form])

  useEffect(() => {
    if (selectedStation && selectedCompany && articleCategory) {
      fetchArticles()
    }
  }, [selectedStation, selectedCompany, articleCategory, fetchArticles])

  useEffect(() => {
    form.setValue("articles", selectedBatches)
  }, [selectedBatches, form])

  /* ------------------------------- HANDLERS ------------------------------- */

    const handleBatchSelect = (article: IArticleByCategory) => {
    setSelectedBatches((prev) => {
        const exists = prev.some((b) => b.batch === article.id.toString())
        if (exists) {
        return prev.filter((b) => b.batch !== article.id.toString())
        }

        const unidad = units?.find(
        (u) =>
            u.label.toUpperCase() === "UNIDAD" ||
            u.value?.toUpperCase() === "UNIDAD"
        )

        return [
        ...prev,
        {
            batch: article.batch.id.toString(),
            batch_name: article.batch.name,
            category: article.article_type?.toUpperCase() ?? "",
            batch_articles: [
            {
                part_number: article.part_number, // ✅ ahora sí correcto
                alt_part_number: Array.isArray(article.alternative_part_number)
                ? article.alternative_part_number.join(", ")
                : article.alternative_part_number ?? "",
                quantity: 1,
                unit:
                article.article_type?.toUpperCase() === "COMPONENT" ||
                article.article_type?.toUpperCase() === "TOOL"
                    ? unidad?.id.toString()
                    : undefined,
            },
            ],
        },
        ]
    })
    }

  const updateArticle = (
    batchId: string,
    index: number,
    field: keyof Article,
    value: any
  ) => {
    setSelectedBatches((prev) =>
      prev.map((b) =>
        b.batch !== batchId
          ? b
          : {
              ...b,
              batch_articles: b.batch_articles.map((a, i) =>
                i === index ? { ...a, [field]: value } : a
              ),
            }
      )
    )
  }

  const removeArticle = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.filter((b) => b.batch !== batchId)
    )
  }

  /* ------------------------------- SUBMIT --------------------------------- */

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedCompany) return

    if (isEditing) {
      await updateRequisition.mutateAsync({
        id: id!,
        data,
        company: selectedCompany.slug,
      })
    } else {
      await createRequisition.mutateAsync({
        data,
        company: selectedCompany.slug,
      })
    }

    onClose()
  }

  /* -------------------------------------------------------------------------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-3 max-h-[90vh]"
      >
        {/* SOLICITANTE + TIPO */}
        <div className="flex gap-2 items-center">
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => (
              <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                <FormLabel>Solicitante</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={employeesLoading}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {employeesLoading && (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        )}
                        {field.value
                          ? `${employees?.find(e => e.dni.toString() === field.value)?.first_name} ${employees?.find(e => e.dni.toString() === field.value)?.last_name}`
                          : "Elige al solicitante..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Busque un empleado..." />
                      <CommandList>
                        <CommandEmpty className="text-sm p-2 text-center">
                          No se ha encontrado ningún empleado.
                        </CommandEmpty>
                        <CommandGroup>
                          {employees?.map(emp => (
                            <CommandItem
                              key={emp.id}
                              value={emp.dni.toString()}
                              onSelect={() => form.setValue("requested_by", emp.dni.toString())}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  emp.dni.toString() === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {emp.first_name} {emp.last_name}
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
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de Req.</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger >
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AERONAUTICO">Aeronáutico</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* BATCHES + ARTÍCULOS */}
        <FormField
          control={form.control}
          name="articles"
          render={({ field }: any) => (
            <FormItem className="flex flex-col">
              <div className="flex gap-4 items-end">
                {/* ---------------------- SELECT DE CATEGORÍA ---------------------- */}
                <FormItem className="flex flex-col w-[150px]">
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    value={articleCategory || ""}
                    onValueChange={(value) => {
                      setArticleCategory(value)
                      setSelectedBatches([]) // Limpiar artículos previos al cambiar categoría
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder="Seleccione..."
                          className="truncate text-muted-foreground"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PART">Parte</SelectItem>
                      <SelectItem value="CONSUMABLE">Consumible</SelectItem>
                      <SelectItem value="COMPONENT">Componente</SelectItem>
                      <SelectItem value="TOOL">Herramienta</SelectItem>
                      {/* Agrega más categorías si es necesario */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                {/* ---------------------- SELECT DE ARTÍCULO ---------------------- */}
                <FormItem className="flex flex-col w-[220px]">
                  <FormLabel>Artículo</FormLabel>

                  {articleCategory ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full h-10 px-3 flex items-center justify-between overflow-hidden",
                              selectedBatches.length === 0 && "text-muted-foreground"
                            )}
                          >
                          <span className="flex-1 text-left truncate">
                            {selectedBatches.length > 0
                              ? `${selectedBatches.length} artículos seleccionados`
                              : "Selecciona un artículo..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-[220px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar artículo..." />
                          <CommandList>
                            <CommandEmpty>No existen artículos...</CommandEmpty>
                            <CommandGroup>
                            {Array.from(
                                new Map(
                                articlesList?.map(article => [
                                    `${article.part_number}-${article.batch.name}`,
                                    article,
                                ]) ?? []
                                ).values()
                            ).map(article => (
                                <CommandItem
                                    key={article.id}
                                    value={`${article.part_number} ${article.batch.name} ${Array.isArray(article.alternative_part_number) ? article.alternative_part_number.join(" ") : article.alternative_part_number ?? ""}`}
                                    onSelect={() => handleBatchSelect(article)}
                                    className="flex items-center gap-2 px-2 py-1"
                                    >
                                    <span className="w-4 flex justify-center">
                                        <Check
                                        className={cn(
                                            selectedBatches.some(b => b.batch === article.id.toString())
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                        />
                                    </span>
                                    <span className="truncate">
                                        {article.part_number} {article.batch.name}
                                    </span>
                                </CommandItem>
                            ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled
                        role="combobox"
                        className="w-full h-10 px-3 flex items-center overflow-hidden text-muted-foreground"
                      >
                        <span className="truncate">
                          Seleccione una categoría primero
                        </span>
                      </Button>
                    </FormControl>
                  )}
                </FormItem>

                {form.watch("type") === "AERONAUTICO" && (
                  <FormField
                    control={form.control}
                    name="aircraft_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-[200px]">
                        <FormLabel>Aeronave</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={aircraftsLoading}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {aircraftsLoading && (
                                  <Loader2 className="size-4 animate-spin mr-2" />
                                )}
                                {field.value
                                  ? aircrafts?.find(a => a.id.toString() === field.value)?.acronym + " - " + aircrafts?.find(a => a.id.toString() === field.value)?.manufacturer?.name
                                  : "Selec. la aeronave..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Busque una aeronave..." />
                              <CommandList>
                                <CommandEmpty>No se ha encontrado ninguna aeronave.</CommandEmpty>
                                <CommandGroup>
                                  {aircrafts?.map(ac => (
                                    <CommandItem
                                      key={ac.id}
                                      value={ac.id.toString()}
                                      onSelect={() =>
                                        form.setValue(
                                          "aircraft_id",
                                          field.value === ac.id.toString() ? undefined : ac.id.toString(),
                                          { shouldValidate: true }
                                        )
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          ac.id.toString() === field.value ? "opacity-100" : "opacity-0",
                                          "mr-2 h-4 w-4"
                                        )}
                                      />
                                      {ac.acronym} - {ac.manufacturer?.name ?? "Sin fabricante"}
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
                )}
              </div>

              <div className="mt-4 space-y-4">
                <ScrollArea className={cn(selectedBatches.length > 1 ? "h-[280px]" : "")}>
                  {selectedBatches.map(batch => (
                    <div key={batch.batch}>
                      <div className="flex items-center">
                        <h4 className="font-semibold">{batch.batch_name}</h4>
                        <Button
                          variant="ghost"
                          type="button"
                          size="icon"
                          onClick={() => removeArticle(batch.batch)}
                        >
                          <MinusCircle className="size-4" />
                        </Button>
                      </div>
                      <ScrollArea className={cn(batch.batch_articles.length > 2 ? "h-[125px]" : "")}>
                        {batch.batch_articles.map((article, index) => (
                          <div key={index} className="flex items-center gap-4 mt-2 py-2 px-1">
                            <Input
                              placeholder="N/P Alterno"
                              value={article.alt_part_number}
                              onChange={e => updateArticle(batch.batch, index, "alt_part_number", e.target.value)}
                            />
                            <Select
                              value={article.unit}
                              disabled={unitsLoading || batch.category === "componente" || batch.category === "herramienta"}
                              onValueChange={v => updateArticle(batch.batch, index, "unit", v)}
                            >
                              <SelectTrigger><SelectValue placeholder="Unidad" /></SelectTrigger>
                              <SelectContent>
                                {units?.map(u => (
                                  <SelectItem key={u.id} value={u.id.toString()}>{u.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              value={article.quantity}
                              min={1}
                              onChange={e => updateArticle(batch.batch, index, "quantity", Number(e.target.value))}
                            />
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* JUSTIFICACIÓN */}
        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justificación</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Necesidad de la pieza X para instalación..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IMAGEN */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen General</FormLabel>
              <div className="flex items-center gap-4">
                {field.value && (
                  <Image
                    src={URL.createObjectURL(field.value)}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <FormControl>
                  <Input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={e => field.onChange(e.target.files?.[0])}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEPARADOR + BOTÓN */}
        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground">SIGEAC</p>
          <Separator className="flex-1" />
        </div>
        <Button
          disabled={createRequisition.isPending || updateRequisition.isPending}
        >
          {isEditing ? "Editar Requisición" : "Generar Requisición"}
          {(createRequisition.isPending || updateRequisition.isPending) && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </form>
    </Form>
  )
}
