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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Check,
  ChevronsUpDown,
  FileText,
  Filter,
  ImageIcon,
  Loader2,
  MinusCircle,
  Package,
  Pencil,
  Plane,
  Send,
  Tag,
  User,
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
    (data) => data.type !== "AERONAUTICO" || Boolean(data.aircraft_id),
    {
      message: "Debe seleccionar una aeronave",
      path: ["aircraft_id"],
    }
  )
  .refine(
    (data) =>
      data.articles.every((b) =>
        b.batch_articles.every((a) => b.category !== "CONSUMABLE" || !!a.unit)
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
  alt_part_number_initial?: string
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

const CATEGORY_LABELS: Record<string, string> = {
  PART: "Parte",
  CONSUMABLE: "Consumible",
  COMPONENT: "Componente",
  TOOL: "Herramienta",
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

  const { data: articlesList, refetch: fetchArticles } = useGetArticlesByCategory(
    Number(selectedStation),
    articleCategory,
    selectedCompany?.slug
  )

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { articles: [] },
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
      if (initialData.articles?.length) {
        setSelectedBatches(initialData.articles as Batch[])
      }
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
    const batchId = article.batch.id.toString()
    const partNumber = article.part_number

    setSelectedBatches((prev) => {
      const existingBatchIndex = prev.findIndex((b) => b.batch === batchId)

      if (existingBatchIndex !== -1) {
        const batch = prev[existingBatchIndex]
        const articleExists = batch.batch_articles.some((a) => a.part_number === partNumber)

        if (articleExists) {
          const updatedArticles = batch.batch_articles.filter((a) => a.part_number !== partNumber)
          if (updatedArticles.length === 0) return prev.filter((b) => b.batch !== batchId)
          return prev.map((b) =>
            b.batch === batchId ? { ...batch, batch_articles: updatedArticles } : b
          )
        }

        return prev.map((b) =>
          b.batch === batchId
            ? {
                ...batch,
                batch_articles: [
                  ...batch.batch_articles,
                  {
                    part_number: article.part_number,
                    alt_part_number: "",
                    alt_part_number_initial: Array.isArray(article.alternative_part_number)
                      ? article.alternative_part_number.join(", ")
                      : article.alternative_part_number ?? "",
                    quantity: 1,
                    unit:
                      article.article_type?.toUpperCase() === "COMPONENT" ||
                      article.article_type?.toUpperCase() === "TOOL"
                        ? "1"
                        : undefined,
                  },
                ],
              }
            : b
        )
      }

      return [
        ...prev,
        {
          batch: batchId,
          batch_name: article.batch.name,
          category: article.article_type?.toUpperCase() ?? "",
          batch_articles: [
            {
              part_number: article.part_number,
              alt_part_number: Array.isArray(article.alternative_part_number)
                ? article.alternative_part_number.join(", ")
                : article.alternative_part_number ?? "",
              quantity: 1,
              unit:
                article.article_type?.toUpperCase() === "COMPONENT" ||
                article.article_type?.toUpperCase() === "TOOL"
                  ? "1"
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

  const removeArticleFromBatch = (batchId: string, index: number) => {
    setSelectedBatches((prev) =>
      prev.reduce<Batch[]>((acc, b) => {
        if (b.batch !== batchId) return [...acc, b]
        const updated = b.batch_articles.filter((_, i) => i !== index)
        if (updated.length === 0) return acc
        return [...acc, { ...b, batch_articles: updated }]
      }, [])
    )
  }

  /* ------------------------------- SUBMIT --------------------------------- */

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedCompany) return

    if (isEditing) {
      await updateRequisition.mutateAsync({ id: id!, data, company: selectedCompany.slug })
    } else {
      await createRequisition.mutateAsync({ data, company: selectedCompany.slug })
    }

    onClose()
  }

  const isPending = createRequisition.isPending || updateRequisition.isPending

  /* -------------------------------------------------------------------------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-5 max-h-[90vh]"
      >
        {/* ROW 1: Solicitante + Tipo */}
        <div className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name="requested_by"
            render={({ field }) => {
              const selectedEmployee = employees?.find((e) => e.dni.toString() === field.value)
              return (
                <FormItem className="w-full flex flex-col space-y-3 mt-1.5">
                  <FormLabel className="flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    Solicitante
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={employeesLoading}
                          variant="outline"
                          role="combobox"
                          className={cn("justify-between", !field.value && "text-muted-foreground")}
                        >
                          {employeesLoading
                            ? <Loader2 className="size-4 animate-spin mr-2" />
                            : selectedEmployee
                              ? <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
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
                            {employees?.map((emp) => (
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
              )
            }}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full mt-2.5">
                <FormLabel className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Tipo de Req.
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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

        {/* ROW 2: Categoría + Artículo + [Aeronave] */}
        <FormFieldp
          control={form.control}
          name="articles"
          render={({ field: _ }: any) => (
            <FormItem className="flex flex-col gap-3">
              <div className="flex gap-3 items-end flex-wrap">
                {/* Categoría */}
                <FormItem className="flex flex-col min-w-[140px]">
                  <FormLabel className="flex items-center gap-1.5">
                    <Filter className="size-3.5 text-muted-foreground" />
                    Categoría
                  </FormLabel>
                  <Select
                    value={articleCategory || ""}
                    onValueChange={(value) => {
                      setArticleCategory(value)
                      setSelectedBatches([])
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PART">Parte</SelectItem>
                      <SelectItem value="CONSUMABLE">Consumible</SelectItem>
                      <SelectItem value="COMPONENT">Componente</SelectItem>
                      <SelectItem value="TOOL">Herramienta</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>

                {/* Artículo */}
                <FormItem className="flex flex-col min-w-[200px] flex-1">
                  <FormLabel className="flex items-center gap-1.5">
                    <Package className="size-3.5 text-muted-foreground" />
                    Artículo
                  </FormLabel>
                  {articleCategory ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between overflow-hidden",
                              selectedBatches.length === 0 && "text-muted-foreground"
                            )}
                          >
                            <span className="flex-1 text-left truncate">
                              {selectedBatches.flatMap((b) => b.batch_articles).length > 0
                                ? `${selectedBatches.flatMap((b) => b.batch_articles).length} artículos seleccionados`
                                : "Selecciona un artículo..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar artículo..." />
                          <CommandList>
                            <CommandEmpty>No existen artículos...</CommandEmpty>
                            <CommandGroup>
                              {Array.from(
                                new Map(
                                  articlesList?.map((a) => [
                                    `${a.part_number}-${a.batch.name}`,
                                    a,
                                  ]) ?? []
                                ).values()
                              ).map((article) => (
                                <CommandItem
                                  key={article.id}
                                  value={`${article.part_number} ${article.batch.name} ${Array.isArray(article.alternative_part_number) ? article.alternative_part_number.join(" ") : article.alternative_part_number ?? ""}`}
                                  onSelect={() => handleBatchSelect(article)}
                                  className="flex items-center gap-2 px-2 py-1"
                                >
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedBatches.some((b) =>
                                        b.batch_articles.some((a) => a.part_number === article.part_number)
                                      )
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <span className="truncate">
                                    {article.part_number} — {article.batch.name}
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
                        className="w-full justify-start text-muted-foreground overflow-hidden"
                      >
                        <span className="truncate">Seleccione una categoría primero</span>
                      </Button>
                    </FormControl>
                  )}
                </FormItem>

                {/* Aeronave (condicional) */}
                {form.watch("type") === "AERONAUTICO" && (
                  <FormField
                    control={form.control}
                    name="aircraft_id"
                    render={({ field }) => {
                      const selectedAircraft = aircrafts?.find((a) => a.id.toString() === field.value)
                      return (
                        <FormItem className="flex flex-col min-w-[180px]">
                          <FormLabel className="flex items-center gap-1.5">
                            <Plane className="size-3.5 text-muted-foreground" />
                            Aeronave
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  disabled={aircraftsLoading}
                                  variant="outline"
                                  role="combobox"
                                  className={cn("justify-between", !field.value && "text-muted-foreground")}
                                >
                                  {aircraftsLoading
                                    ? <Loader2 className="size-4 animate-spin mr-2" />
                                    : selectedAircraft
                                      ? <span className="truncate max-w-[140px]">{selectedAircraft.acronym} - {selectedAircraft.manufacturer?.name ?? "Sin fabricante"}</span>
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
                                    {aircrafts?.map((ac) => (
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
                                            "mr-2 h-4 w-4",
                                            ac.id.toString() === field.value ? "opacity-100" : "opacity-0"
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
                      )
                    }}
                  />
                )}
              </div>

              {/* Article cards grouped by batch */}
              <div className="mt-3">
                <ScrollArea className={cn(selectedBatches.length > 1 ? "h-[260px]" : "")}>
                  {selectedBatches.map((batch) => (
                    <div key={batch.batch} className="rounded-md border bg-muted/30 p-3 mb-3">
                      {batch.batch_articles.map((article, index) => (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                           <p className="text-lg font-medium"><span className="font-bold">{article.part_number}</span> - {batch.batch_name}</p>
                          </div>
                          <div key={`${batch.batch}-${article.part_number}`} className="mb-2">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="N/P Alterno"
                                value={
                                  article.alt_part_number !== undefined
                                    ? article.alt_part_number
                                    : article.alt_part_number_initial ?? ""
                                }
                                className="text-xs h-8"
                                onChange={(e) => updateArticle(batch.batch, index, "alt_part_number", e.target.value)}
                              />
                              <Select
                                value={article.unit}
                                disabled={unitsLoading || batch.category === "COMPONENT" || batch.category === "TOOL"}
                                onValueChange={(v) => updateArticle(batch.batch, index, "unit", v)}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder="Unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units?.map((u) => (
                                    <SelectItem key={u.id} value={u.id.toString()}>
                                      {u.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Cant."
                                value={article.quantity}
                                min={1}
                                className="text-xs h-8 w-20 shrink-0"
                                onChange={(e) => updateArticle(batch.batch, index, "quantity", Number(e.target.value))}
                              />
                              <Button
                                variant="ghost"
                                type="button"
                                size="icon"
                                onClick={() => removeArticleFromBatch(batch.batch, index)}
                                className="h-6 w-6 hover:text-destructive shrink-0"
                              >
                                <MinusCircle className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ))}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ROW 3: Justificación + Imagen side-by-side */}
        <div className="grid grid-cols-2 gap-3 items-start">
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  Justificación
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Necesidad de la pieza X para instalación..."
                    className="resize-none h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  Imagen General
                </FormLabel>
                <div className="flex items-center gap-3">
                  {field.value && (
                    <Image
                      src={URL.createObjectURL(field.value)}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md object-cover shrink-0"
                    />
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg, image/png"
                      className="text-xs"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-x-4">
          <Separator className="flex-1" />
          <p className="text-muted-foreground text-xs">SIGEAC</p>
          <Separator className="flex-1" />
        </div>

        <Button disabled={isPending} className="gap-2">
          {isEditing
            ? <><Pencil className="size-4" /> Editar Requisición</>
            : <><Send className="size-4" /> Generar Requisición</>}
          {isPending && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>
    </Form>
  )
}
