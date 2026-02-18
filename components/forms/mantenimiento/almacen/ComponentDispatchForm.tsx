"use client"

import { useCreateDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { cn } from "@/lib/utils"

import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles"
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"

// ✅ Hook de artículos generales
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"

import type { Article, Batch, GeneralArticle } from "@/types"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertCircle,
  Building2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  PackagePlus,
  Plane,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

interface FormProps {
  onClose: () => void
}

interface BatchesWithCountProp extends Batch {
  articles: Article[]
  batch_id: number
}

// ===== Schema =====
const ComponentItemSchema = z.object({
  article_id: z.coerce.number(),
  batch_id: z.coerce.number(),
  serial: z.string().nullable().optional(),
  quantity: z.coerce.number().optional(),
})

const GeneralItemSchema = z.object({
  general_article_id: z.coerce.number(),
  quantity: z.coerce.number(),
})

const FormSchema = z
  .object({
    requested_by: z.string({ message: "Debe seleccionar quién recibe." }),
    work_order: z.string(),
    submission_date: z.date({ message: "Debe ingresar la fecha." }),
    justification: z.string({ message: "Debe ingresar una justificación de la salida." }),
    department_id: z.string({ message: "Debe seleccionar un destino." }),
    status: z.string(),

    // ✅ Multi
    aeronautical_articles: z.array(ComponentItemSchema).default([]),
    general_articles: z.array(GeneralItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const total = (data.aeronautical_articles?.length ?? 0) + (data.general_articles?.length ?? 0)
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar al menos un artículo.",
        path: ["aeronautical_articles"],
      })
    }
  })

type FormSchemaType = z.infer<typeof FormSchema>

function sanitizeDecimal(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length <= 1) return cleaned
  return `${parts[0]}.${parts.slice(1).join("")}`
}

type MsgLevel = "error" | "warn"
type RowMsg = { msg: string; level: MsgLevel } | undefined

export function ComponentDispatchForm({ onClose }: FormProps) {
  const { user } = useAuth()
  const { selectedStation, selectedCompany } = useCompanyStore()

  const [openAdd, setOpenAdd] = useState(false)
  const [addTab, setAddTab] = useState<"component" | "general">("component")
  const [isDepartment, setIsDepartment] = useState(false)

  const { createDispatchRequest } = useCreateDispatchRequest()

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(selectedCompany?.slug)
  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug)

  const {
    data: batches,
    isPending: isBatchesLoading,
    isError: isBatchesError,
  } = useGetBatchesWithInWarehouseArticles({
    location_id: Number(selectedStation!),
    company: selectedCompany!.slug,
    category: "component",
  })

  const {
    data: employees,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation?.toString(),
    acronym: "MANP",
  })

  const { data: generalRes, isLoading: isGeneralLoading } = useGetGeneralArticles()
  const generalArticles = useMemo<GeneralArticle[]>(
    () => generalRes ?? [],
    [generalRes]
  )

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      justification: "",
      requested_by: `${user?.employee?.[0]?.dni ?? ""}`,
      department_id: "",
      status: "proceso",
      aeronautical_articles: [],
      general_articles: [],
    },
  })

  const { control, setValue } = form
  const compFA = useFieldArray({ control, name: "aeronautical_articles" })
  const genFA = useFieldArray({ control, name: "general_articles" })

  const watchedCompRaw = useWatch({ control, name: "aeronautical_articles" })
  const watchedGenRaw = useWatch({ control, name: "general_articles" })

  const watchedComp = useMemo(() => watchedCompRaw ?? [], [watchedCompRaw])
  const watchedGen = useMemo(() => watchedGenRaw ?? [], [watchedGenRaw])

  // Limpiar destino cuando cambia el tipo
  useEffect(() => {
    setValue("department_id", "")
  }, [isDepartment, setValue])

  // Lookups: componentes y generales
  const compById = useMemo(() => {
    const map = new Map<number, Article>()
    batches?.forEach((b: BatchesWithCountProp) => b.articles?.forEach((a) => a?.id != null && map.set(a.id, a)))
    return map
  }, [batches])

  const genById = useMemo(() => {
    const map = new Map<number, GeneralArticle>()
    generalArticles.forEach((a) => map.set(a.id, a))
    return map
  }, [generalArticles])

  const getCompMax = useCallback(
    (id: number) => compById.get(id)?.quantity ?? 0,
    [compById]
  )

  const getGenMax = useCallback(
    (id: number) => genById.get(id)?.quantity ?? 0,
    [genById]
  )

  const validateAndClamp = useCallback(
    (key: string, raw: string, max: number) => {
      const n = parseFloat(raw || "0") || 0

      if (!raw || n <= 0) {
        setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" })
        return raw
      }

      if (max > 0 && n > max) {
        setRowMsg(key, { msg: `Se ajustó al máximo disponible: ${max}`, level: "warn" })
        return String(max)
      }

      setRowMsg(key, undefined)
      return raw
    },
    []
  )

  // selected sets para toggles
  const compSelectedSet = useMemo(() => new Set(watchedComp.map((x) => Number(x.article_id))), [watchedComp])
  const genSelectedSet = useMemo(
    () => new Set(watchedGen.map((x) => Number(x.general_article_id))),
    [watchedGen]
  )

  // ===== Mensajes y drafts de qty por fila =====
  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({})
  const [msgByKey, setMsgByKey] = useState<Record<string, RowMsg>>({})

  const compKey = (fieldId: string) => `C:${fieldId}`
  const genKey = (fieldId: string) => `G:${fieldId}`

  const setRowMsg = (key: string, msg: RowMsg) => setMsgByKey((p) => ({ ...p, [key]: msg }))

  const commitCompQty = useCallback(
    (index: number, fieldId: string) => {
      const key = compKey(fieldId)
      const item = watchedComp[index]
      const id = Number(item?.article_id || 0)
      const max = id ? getCompMax(id) : 0

      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)

      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`aeronautical_articles.${index}.quantity`, 1)
    },
    [qtyByKey, setValue, watchedComp, getCompMax, validateAndClamp]
  )

  const commitGenQty = useCallback(
    (index: number, fieldId: string) => {
      const key = genKey(fieldId)
      const item = watchedGen[index]
      const id = Number(item?.general_article_id || 0)
      const max = id ? getGenMax(id) : 0

      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)

      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`general_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    },
    [qtyByKey, setValue, watchedGen, getGenMax, validateAndClamp]
  )


  const clearRowState = (key: string) => {
    setQtyByKey((p) => {
      const n = { ...p }
      delete n[key]
      return n
    })
    setMsgByKey((p) => {
      const n = { ...p }
      delete n[key]
      return n
    })
  }

  const setToMaxComp = (index: number, fieldId: string) => {
    const item = watchedComp[index]
    const id = Number(item?.article_id || 0)
    const max = id ? getCompMax(id) : 0
    const next = max > 0 ? String(max) : "0"

    setQtyByKey((p) => ({ ...p, [compKey(fieldId)]: next }))
    setRowMsg(compKey(fieldId), undefined)
    setValue(`aeronautical_articles.${index}.quantity`, 1)
  }

  const setToMaxGen = (index: number, fieldId: string) => {
    const item = watchedGen[index]
    const id = Number(item?.general_article_id || 0)
    const max = id ? getGenMax(id) : 0
    const next = max > 0 ? String(max) : "0"

    setQtyByKey((p) => ({ ...p, [genKey(fieldId)]: next }))
    setRowMsg(genKey(fieldId), undefined)
    setValue(`general_articles.${index}.quantity`, parseFloat(next) || 0)
  }

  // ===== Agregar con toggle =====
  const addComponent = (article: Article, batch_id: number) => {
    if (!article?.id) return
    const id = Number(article.id)

    // toggle remove
    if (compSelectedSet.has(id)) {
      const idx = watchedComp.findIndex((x) => Number(x.article_id) === id)
      if (idx >= 0 && compFA.fields[idx]) removeComponentRow(idx, compFA.fields[idx].id)
      setOpenAdd(false)
      return
    }

    compFA.append({
      article_id: id,
      batch_id: Number(batch_id),
      serial: article.serial ?? null,
      quantity: 1,
    })
    setOpenAdd(false)
  }

  const addGeneral = (ga: GeneralArticle) => {
    const id = Number(ga?.id || 0)
    if (!id) return

    if (genSelectedSet.has(id)) {
      const idx = watchedGen.findIndex((x) => Number(x.general_article_id) === id)
      if (idx >= 0 && genFA.fields[idx]) removeGeneralRow(idx, genFA.fields[idx].id)
      setOpenAdd(false)
      return
    }

    genFA.append({ general_article_id: id, quantity: 0 })
    setOpenAdd(false)
  }

  const removeComponentRow = (index: number, fieldId: string) => {
    compFA.remove(index)
    clearRowState(compKey(fieldId))
  }

  const removeGeneralRow = (index: number, fieldId: string) => {
    genFA.remove(index)
    clearRowState(genKey(fieldId))
  }

  // ===== Validaciones para submit =====
  const hasBlockingQtyError = useMemo(() => Object.values(msgByKey).some((m) => m?.level === "error"), [msgByKey])

  const hasInvalidQty = useMemo(() => {
    const compInvalid = compFA.fields.some((f) => {
      const raw = qtyByKey[compKey(f.id)] ?? ""
      return (parseFloat(raw || "0") || 0) < 0
    })
    const genInvalid = genFA.fields.some((f) => {
      const raw = qtyByKey[genKey(f.id)] ?? ""
      return (parseFloat(raw || "0") || 0) <= 0
    })
    return compInvalid || genInvalid
  }, [compFA.fields, genFA.fields, qtyByKey])

  const messageClass = (level: MsgLevel) => (level === "warn" ? "text-amber-600" : "text-destructive")

  // ===== Submit =====
  const onSubmit = async (data: FormSchemaType) => {
    // validación final por stock componentes
    for (let i = 0; i < data.aeronautical_articles.length; i++) {
      const row = data.aeronautical_articles[i]
      const max = getCompMax(Number(row.article_id))
      const fieldId = compFA.fields[i]?.id
      const key = fieldId ? compKey(fieldId) : null

      if (row.quantity! <= 0) {
        if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" })
        return
      }
      if (max > 0 && row.quantity! > max) {
        if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" })
        return
      }
    }

    // validación final por stock generales
    for (let i = 0; i < data.general_articles.length; i++) {
      const row = data.general_articles[i]
      const max = getGenMax(Number(row.general_article_id))
      const fieldId = genFA.fields[i]?.id
      const key = fieldId ? genKey(fieldId) : null

      if (row.quantity <= 0) {
        if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" })
        return
      }
      if (max > 0 && row.quantity > max) {
        if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" })
        return
      }
    }

    if (hasBlockingQtyError) return

    const formattedData = {
      ...data,
      created_by: `${user?.employee?.[0]?.dni ?? ""}`,
      delivered_by: `${user?.employee?.[0]?.dni ?? ""}`,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "componente",
      isDepartment,
      aircraft_id: isDepartment ? null : data.department_id,
      // si es departamento, el backend suele esperar department_id; tú ya lo mandas en data.department_id
    }

     await createDispatchRequest.mutateAsync({
       data: {
         ...formattedData,
         user_id: Number(user!.id),
         status: "APROBADO",
       },
       company: selectedCompany!.slug,
     })
    onClose()
  }

  const disabledAdd = isBatchesLoading || isGeneralLoading
  const compCount = compFA.fields.length
  const genCount = genFA.fields.length

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">
        {/* Personal Responsable */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Personal Responsable
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 mt-1">
              <Label className="text-sm font-medium">Entregado por:</Label>
              <Input disabled value={`${user?.first_name} ${user?.last_name}`} />
            </div>

            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recibe / MTTO</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el responsable..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeesLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!employeesLoading && employeesError && (
                        <div className="py-4 text-center text-sm text-muted-foreground">Error al cargar empleados</div>
                      )}
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={`${employee.dni}`}>
                          {employee.first_name} {employee.last_name} - {employee.job_title.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información de la Solicitud */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Información de la Solicitud
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="work_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Ord. de Trabajo</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Ej: OT-000123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="submission_date"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-1">
                  <FormLabel className="text-sm font-medium">Fecha de Solicitud</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione...</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 md:col-span-2">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <div className="flex items-center justify-between mb-2 gap-2 w-full">
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        {isDepartment ? (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Plane className="h-4 w-4 text-muted-foreground" />
                        )}
                        Destino
                      </FormLabel>

                      <div className="flex items-center gap-1">
                        <Checkbox
                          id="is-department"
                          checked={isDepartment}
                          onCheckedChange={(checked) => setIsDepartment(checked as boolean)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor="is-department"
                          className="text-xs text-center font-medium leading-none cursor-pointer text-muted-foreground"
                        >
                          ¿Es para un departamento?
                        </label>
                      </div>
                    </div>

                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isDepartment ? isDepartmentsLoading : isAircraftsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue
                            placeholder={isDepartment ? "Seleccione un departamento..." : "Seleccione una aeronave..."}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isDepartment ? (
                          <>
                            {isDepartmentsLoading && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {departments?.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <>
                            {isAircraftsLoading && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {aircrafts?.map((a) => (
                              <SelectItem key={a.id} value={a.id.toString()}>
                                {a.acronym}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Artículos a Retirar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Artículos a Retirar
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Agregar (tabs) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center justify-between">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Componentes: {compCount} · Ferretería: {genCount}
              </span>
            </Label>

            <Popover
              open={openAdd}
              onOpenChange={(v) => {
                setOpenAdd(v)
                if (v) setAddTab("component")
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAdd}
                  className="w-full justify-between h-10"
                  disabled={disabledAdd}
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    {disabledAdd ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                    Seleccione un artículo...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <div className="p-2 border-b flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={addTab === "component" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("component")}
                    >
                      Componentes <span className="ml-2 text-xs opacity-80">({compCount})</span>
                    </Button>
                    <Button
                      type="button"
                      variant={addTab === "general" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("general")}
                    >
                      Ferretería <span className="ml-2 text-xs opacity-80">({genCount})</span>
                    </Button>
                  </div>

                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenAdd(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Command>
                  <CommandInput
                    placeholder={
                      addTab === "component"
                        ? "Buscar por lote, serial, parte o descripción..."
                        : "Buscar por descripción, modelo o tipo..."
                    }
                  />
                  <CommandList>
                    <CommandEmpty className="text-xs italic text-muted-foreground p-4">
                      No se han encontrado artículos...
                    </CommandEmpty>

                    {addTab === "component" ? (
                      isBatchesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : isBatchesError ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">Error al cargar componentes</div>
                      ) : (
                        batches?.map((batch: BatchesWithCountProp) => (
                          <CommandGroup key={batch.batch_id} heading={batch.name}>
                            {batch.articles.map((article) => {
                              const already = compSelectedSet.has(Number(article.id))
                              return (
                                <CommandItem
                                  key={`${article.id}-${batch.batch_id}`}
                                  value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                                  onSelect={() => addComponent(article, batch.batch_id)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium truncate">
                                      {article.serial ?? "Sin serial"} · {article.part_number}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {article.description ?? "Sin descripción"}
                                      {typeof article.quantity === "number" ? ` • Disp: ${article.quantity} ${article.unit}` : ""}
                                    </span>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        ))
                      )
                    ) : isGeneralLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    ) : (
                      <CommandGroup heading="Inventario general">
                        {generalArticles.map((ga) => {
                          const already = genSelectedSet.has(Number(ga.id))
                          return (
                            <CommandItem
                              key={`g-${ga.id}`}
                              value={`${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`}
                              onSelect={() => addGeneral(ga)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{ga.description ?? "N/A"}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {ga.brand_model ?? "N/A"} · {ga.variant_type ?? "N/A"} · Disp: {ga.quantity ?? 0} {ga.general_primary_unit?.label ?? ""}
                                </span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Lista: Componentes */}
          {compFA.fields.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Componentes</div>

              {compFA.fields.map((f, index) => {
                const key = compKey(f.id)
                const item = watchedComp[index]
                const id = Number(item?.article_id || 0)
                const article = id ? compById.get(id) : undefined
                const max = id ? getCompMax(id) : 0

                const qty = qtyByKey[key] ?? ""
                const rowMsg = msgByKey[key]

                return (
                  <div key={f.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {article?.serial ?? "Sin serial"} · {article?.part_number ?? `ID: ${id}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {article?.description ?? "Sin descripción"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeComponentRow(index, f.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm font-medium">Cantidad</Label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setToMaxComp(index, f.id)}
                          className="h-7 text-xs text-primary hover:text-primary"
                          disabled={!article}
                        >
                          Usar máximo
                        </Button>
                      </div>

                      <Input
                        type="text"
                        disabled
                        value={1}
                        onChange={(e) => {
                          const next = sanitizeDecimal(e.target.value)
                          setQtyByKey((p) => ({ ...p, [key]: next }))
                        }}
                        onBlur={() => commitCompQty(index, f.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            commitCompQty(index, f.id)
                            ;(e.currentTarget as HTMLInputElement).blur()
                          }
                        }}
                        placeholder={article ? `Máx: ${article.quantity}` : "Ingrese la cantidad..."}
                        className={cn(
                          "h-10",
                          rowMsg?.level === "error" && "border-destructive focus-visible:ring-destructive",
                          rowMsg?.level === "warn" && "border-amber-500 focus-visible:ring-amber-500"
                        )}
                      />

                      {rowMsg?.msg && (
                        <div className={cn("flex items-center gap-1 text-xs", messageClass(rowMsg.level))}>
                          <AlertCircle className="h-3 w-3" />
                          {rowMsg.msg}
                        </div>
                      )}

                      {max > 0 && <p className="text-[11px] text-muted-foreground">Disponible actual: {max}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista: Generales */}
          {genFA.fields.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ferretería</div>

              {genFA.fields.map((f, index) => {
                const key = genKey(f.id)
                const item = watchedGen[index]
                const id = Number(item?.general_article_id || 0)
                const ga = id ? genById.get(id) : undefined
                const max = id ? getGenMax(id) : 0

                const qty = qtyByKey[key] ?? ""
                const rowMsg = msgByKey[key]

                return (
                  <div key={f.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {ga?.description ?? `ID: ${id}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ga?.brand_model ?? "N/A"} · {ga?.variant_type ?? "N/A"} · Disponible: {ga?.quantity ?? 0} {ga?.general_primary_unit?.label ?? ""}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeGeneralRow(index, f.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-sm font-medium">Cantidad</Label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setToMaxGen(index, f.id)}
                          className="h-7 text-xs text-primary hover:text-primary"
                          disabled={!ga}
                        >
                          Usar máximo
                        </Button>
                      </div>

                      <Input
                        type="text"
                        disabled={!ga}
                        value={qty}
                        onChange={(e) => {
                          const next = sanitizeDecimal(e.target.value)
                          setQtyByKey((p) => ({ ...p, [key]: next }))
                        }}
                        onBlur={() => commitGenQty(index, f.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            commitGenQty(index, f.id)
                            ;(e.currentTarget as HTMLInputElement).blur()
                          }
                        }}
                        placeholder={ga ? `Máx: ${ga.quantity ?? 0}` : "Ingrese la cantidad..."}
                        className={cn(
                          "h-10",
                          rowMsg?.level === "error" && "border-destructive focus-visible:ring-destructive",
                          rowMsg?.level === "warn" && "border-amber-500 focus-visible:ring-amber-500"
                        )}
                      />

                      {rowMsg?.msg && (
                        <div className={cn("flex items-center gap-1 text-xs", messageClass(rowMsg.level))}>
                          <AlertCircle className="h-3 w-3" />
                          {rowMsg.msg}
                        </div>
                      )}

                      {max > 0 && <p className="text-[11px] text-muted-foreground">Disponible actual: {max}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Justificación */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Justificación
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea rows={4} className="w-full resize-none" placeholder="Ej: Se requiere para mantenimiento..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-2" />

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createDispatchRequest?.isPending}
            className="min-w-[100px] h-10"
          >
            Cancelar
          </Button>

          <Button
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[140px] h-10"
            disabled={
              createDispatchRequest?.isPending ||
              compCount + genCount === 0 ||
              hasBlockingQtyError ||
              hasInvalidQty ||
              !form.getValues("requested_by") ||
              !form.getValues("department_id") ||
              !form.getValues("submission_date")
            }
            type="submit"
          >
            {createDispatchRequest?.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              "Crear Salida"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
