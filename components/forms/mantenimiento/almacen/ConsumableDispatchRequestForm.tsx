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
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { useCompanyStore } from "@/stores/CompanyStore"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  AlertCircle,
  Building2,
  Calculator,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  PackagePlus,
  Plane,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { useGetWorkOrderEmployees } from "@/hooks/mantenimiento/planificacion/useGetWorkOrderEmployees"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"
import type { Article, Batch, Department, Employee, GeneralArticle } from "@/types"

// Conversión
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId"
import { useGetConversionByGeneralArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId"
import { useGetEmployeesByDepartment } from "@/hooks/sistema/useGetEmployeesByDepartament"

// ✅ AJUSTA ESTE IMPORT al hook que ya creaste para artículos generales.
// Debe devolver exactamente el mismo shape que el de consumibles (id, equivalence, unit_primary, unit_secondary, etc.)

interface FormProps {
  onClose: () => void
}

interface BatchesWithCountProp extends Batch {
  articles: Article[]
  batch_id: number
}

const AeronauticalItemSchema = z.object({
  article_id: z.coerce.number(),
  quantity: z.coerce.number(),
})

const GeneralItemSchema = z.object({
  general_article_id: z.coerce.number(),
  quantity: z.coerce.number(),
})

const FormSchema = z
  .object({
    work_order: z.string(),
    requested_by: z.string(),
    submission_date: z.date({ message: "Debe ingresar la fecha." }),
    justification: z.string({ message: "Debe ingresar una justificación de la salida." }),
    department_id: z.string(),
    status: z.string(),
    unit: z.enum(["litros", "mililitros"]).optional(),

    aeronautical_articles: z.array(AeronauticalItemSchema).default([]),
    general_articles: z.array(GeneralItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const total =
      (data.aeronautical_articles?.length ?? 0) + (data.general_articles?.length ?? 0)
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

type ConversionTarget = "aero" | "general"

export function ConsumableDispatchForm({ onClose }: FormProps) {
  const { user } = useAuth()
  const { selectedStation, selectedCompany } = useCompanyStore()

  const [openAdd, setOpenAdd] = useState(false)
  const [isDepartment, setIsDepartment] = useState(false)

  const [requestedBy, setRequestedBy] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { createDispatchRequest } = useCreateDispatchRequest()

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(
    selectedCompany?.slug
  )

  const { data: employeesByDepartment, isLoading: isEmployeesByDepartmentLoading } = useGetEmployeesByDepartment(selectedDepartment?.acronym, selectedStation, selectedCompany?.slug)

  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(
    selectedCompany?.slug
  )

  const { data: batches, isPending: isBatchesLoading } = useGetBatchesWithInWarehouseArticles({
    location_id: Number(selectedStation!),
    company: selectedCompany!.slug,
    category: "consumable",
  })

  const { data: employees, isLoading: employeesLoading } = useGetWorkOrderEmployees({
    company: selectedCompany?.slug,
    location_id: selectedStation?.toString(),
    acronym: "MANP",
  })

  const { data: hardwareRes, isLoading: isHardwareLoading } = useGetGeneralArticles()
  const hardwareArticles = useMemo<GeneralArticle[]>(() => {
    return hardwareRes ?? []
  }, [hardwareRes])

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      work_order: "",
      justification: "",
      requested_by: `${user?.employee?.[0]?.dni ?? ""}`,
      department_id: "",
      status: "proceso",
      aeronautical_articles: [],
      general_articles: [],
    },
  })

  const { control, setValue, getValues } = form
  const aeroFA = useFieldArray({ control, name: "aeronautical_articles" })
  const genFA = useFieldArray({ control, name: "general_articles" })
  console.log(isDepartment, selectedDepartment)
  // Lookups
  const aeroById = useMemo(() => {
    const map = new Map<number, Article>()
    batches?.forEach((b: BatchesWithCountProp) => {
      b.articles?.forEach((a) => {
        if (a?.id != null) map.set(a.id, a)
      })
    })
    return map
  }, [batches])

  const genById = useMemo(() => {
    const map = new Map<number, GeneralArticle>()
    hardwareArticles.forEach((a) => map.set(a.id, a))
    return map
  }, [hardwareArticles])

  const getAeroMax = useCallback(
    (articleId: number) => aeroById.get(articleId)?.quantity || 0,
    [aeroById]
  )
  const getGenMax = useCallback(
    (generalId: number) => genById.get(generalId)?.quantity || 0,
    [genById]
  )

  // Reset destino al cambiar tipo
  useEffect(() => {
    setValue("department_id", "")
  }, [isDepartment, setValue])

  // =============== Cantidades (local draft por fila) ===============
  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({})
  const [msgByKey, setMsgByKey] = useState<Record<string, RowMsg>>({})

  const aeroKey = (fieldId: string) => `A:${fieldId}`
  const genKey = (fieldId: string) => `G:${fieldId}`

  const setRowMsg = (key: string, msg: RowMsg) => {
    setMsgByKey((p) => ({ ...p, [key]: msg }))
  }

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

  const commitAeroQty = useCallback(
    (index: number, fieldId: string) => {
      const key = aeroKey(fieldId)
      const item = getValues(`aeronautical_articles.${index}`)
      const max = getAeroMax(item.article_id)

      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)

      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`aeronautical_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    },
    [getValues, qtyByKey, setValue, getAeroMax, validateAndClamp]
  )

  const commitGenQty = useCallback(
    (index: number, fieldId: string) => {
      const key = genKey(fieldId)
      const item = getValues(`general_articles.${index}`)
      const max = getGenMax(item.general_article_id)

      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)

      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`general_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    },
    [getValues, qtyByKey, setValue, getGenMax, validateAndClamp]
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

  const setToMaxAero = (index: number, fieldId: string) => {
    const key = aeroKey(fieldId)
    const item = getValues(`aeronautical_articles.${index}`)
    const max = getAeroMax(item.article_id)
    const next = max > 0 ? String(max) : "0"

    setQtyByKey((p) => ({ ...p, [key]: next }))
    setRowMsg(key, undefined)
    setValue(`aeronautical_articles.${index}.quantity`, parseFloat(next) || 0)
  }

  const setToMaxGen = (index: number, fieldId: string) => {
    const key = genKey(fieldId)
    const item = getValues(`general_articles.${index}`)
    const max = getGenMax(item.general_article_id)
    const next = max > 0 ? String(max) : "0"

    setQtyByKey((p) => ({ ...p, [key]: next }))
    setRowMsg(key, undefined)
    setValue(`general_articles.${index}.quantity`, parseFloat(next) || 0)
  }

  // =============== Conversión (una fila activa, aero o general) ===============
  const [conversionTarget, setConversionTarget] = useState<ConversionTarget | null>(null)
  const [conversionRowFieldId, setConversionRowFieldId] = useState<string | null>(null)
  const [conversionRowIndex, setConversionRowIndex] = useState<number | null>(null)

  const [conversionArticleId, setConversionArticleId] = useState<number | null>(null)
  const [conversionGeneralArticleId, setConversionGeneralArticleId] = useState<number | null>(null)

  const [selectedConversion, setSelectedConversion] = useState<any>(null)
  const [conversionInput, setConversionInput] = useState("")

  // Aeronáutico
  const { data: aeroConversions, isLoading: isAeroConversionLoading } =
    useGetConversionByConsmable(conversionArticleId ?? null, selectedCompany?.slug)

  // Ferretería
  const { data: genConversions, isLoading: isGenConversionLoading } =
    useGetConversionByGeneralArticle(conversionGeneralArticleId ?? null, selectedCompany?.slug)

  const closeConversion = () => {
    setConversionTarget(null)
    setConversionRowFieldId(null)
    setConversionRowIndex(null)
    setConversionArticleId(null)
    setConversionGeneralArticleId(null)
    setSelectedConversion(null)
    setConversionInput("")
  }

  const openConversionForAero = (index: number, fieldId: string, articleId: number) => {
    setConversionTarget("aero")
    setConversionRowFieldId(fieldId)
    setConversionRowIndex(index)
    setConversionArticleId(articleId)

    setConversionGeneralArticleId(null)
    setSelectedConversion(null)
    setConversionInput("")
  }

  const openConversionForGeneral = (index: number, fieldId: string, generalArticleId: number) => {
    setConversionTarget("general")
    setConversionRowFieldId(fieldId)
    setConversionRowIndex(index)
    setConversionGeneralArticleId(generalArticleId)

    setConversionArticleId(null)
    setSelectedConversion(null)
    setConversionInput("")
  }

  const getActiveConversionList = () => (conversionTarget === "general" ? genConversions : aeroConversions)
  const isActiveConversionLoading =
    conversionTarget === "general" ? isGenConversionLoading : isAeroConversionLoading

  const applyConversion = () => {
    if (conversionRowIndex == null || conversionRowFieldId == null || !conversionTarget) return
    if (!selectedConversion || !conversionInput) return

    const inputValue = parseFloat(conversionInput) || 0
    const result = Number((inputValue / selectedConversion.equivalence).toFixed(6))

    if (conversionTarget === "aero") {
      const id = conversionArticleId
      if (id == null) return

      const max = getAeroMax(id)
      let finalQuantity = result

      const key = aeroKey(conversionRowFieldId)

      if (max > 0 && result > max) {
        finalQuantity = max
        setRowMsg(key, { msg: `Conversión: se ajustó al máximo disponible (${max}).`, level: "warn" })
      } else {
        setRowMsg(key, undefined)
      }

      const nextStr = String(finalQuantity)
      setQtyByKey((p) => ({ ...p, [key]: nextStr }))
      setValue(`aeronautical_articles.${conversionRowIndex}.quantity`, finalQuantity)

      closeConversion()
      return
    }

    // general
    const gid = conversionGeneralArticleId
    if (gid == null) return

    const max = getGenMax(gid)
    let finalQuantity = result

    const key = genKey(conversionRowFieldId)

    if (max > 0 && result > max) {
      finalQuantity = max
      setRowMsg(key, { msg: `Conversión: se ajustó al máximo disponible (${max}).`, level: "warn" })
    } else {
      setRowMsg(key, undefined)
    }

    const nextStr = String(finalQuantity)
    setQtyByKey((p) => ({ ...p, [key]: nextStr }))
    setValue(`general_articles.${conversionRowIndex}.quantity`, finalQuantity)

    closeConversion()
  }

  // =============== Agregar items ===============
  const handleAddAeronautical = (article: Article) => {
    const current = getValues("aeronautical_articles")
    const exists = current.some((x) => x.article_id === Number(article.id))
    if (exists) {
      setOpenAdd(false)
      return
    }

    aeroFA.append({ article_id: Number(article.id), quantity: 0 })

    // Mantiene tu comportamiento: si no es "u", default litros
    if (article.unit !== "u") setValue("unit", "litros")
    setOpenAdd(false)
  }

  const handleAddGeneral = (ga: GeneralArticle) => {
    const current = getValues("general_articles")
    const exists = current.some((x) => x.general_article_id === Number(ga.id))
    if (exists) {
      setOpenAdd(false)
      return
    }

    genFA.append({ general_article_id: Number(ga.id), quantity: 0 })
    setOpenAdd(false)
  }

  const removeAeroRow = (index: number, fieldId: string) => {
    aeroFA.remove(index)
    clearRowState(aeroKey(fieldId))
    if (conversionTarget === "aero" && conversionRowFieldId === fieldId) closeConversion()
  }

  const removeGenRow = (index: number, fieldId: string) => {
    genFA.remove(index)
    clearRowState(genKey(fieldId))
    if (conversionTarget === "general" && conversionRowFieldId === fieldId) closeConversion()
  }

  // =============== Validaciones UI submit ===============
  const hasBlockingQtyError = useMemo(() => {
    return Object.values(msgByKey).some((m) => m?.level === "error")
  }, [msgByKey])

  const hasInvalidQty = useMemo(() => {
    const aeroInvalid = aeroFA.fields.some((f) => {
      const raw = qtyByKey[aeroKey(f.id)] ?? ""
      const v = parseFloat(raw || "0") || 0
      return v <= 0
    })
    const genInvalid = genFA.fields.some((f) => {
      const raw = qtyByKey[genKey(f.id)] ?? ""
      const v = parseFloat(raw || "0") || 0
      return v <= 0
    })
    return aeroInvalid || genInvalid
  }, [aeroFA.fields, genFA.fields, qtyByKey])

  // =============== Submit ===============
  const onSubmit = async (data: FormSchemaType) => {
    // Validación final por stock + seteo de mensajes por fila si aplica
    for (let i = 0; i < data.aeronautical_articles.length; i++) {
      const item = data.aeronautical_articles[i]
      const max = getAeroMax(item.article_id)
      const fieldId = aeroFA.fields[i]?.id
      const key = fieldId ? aeroKey(fieldId) : null

      if (item.quantity <= 0) {
        if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" })
        return
      }
      if (max > 0 && item.quantity > max) {
        if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" })
        return
      }
    }

    for (let i = 0; i < data.general_articles.length; i++) {
      const item = data.general_articles[i]
      const max = getGenMax(item.general_article_id)
      const fieldId = genFA.fields[i]?.id
      const key = fieldId ? genKey(fieldId) : null

      if (item.quantity <= 0) {
        if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" })
        return
      }
      if (max > 0 && item.quantity > max) {
        if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" })
        return
      }
    }

    if (hasBlockingQtyError) return

    const formattedData = {
      ...data,
      created_by: user!.username,
      submission_date: format(data.submission_date, "yyyy-MM-dd"),
      category: "consumible",
      status: "APROBADO",
      approved_by: user?.employee?.[0]?.dni,
      delivered_by: user?.employee?.[0]?.dni,
      user_id: Number(user!.id),
      isDepartment,
      aircraft_id: isDepartment ? null : data.department_id,
      department_id: isDepartment ? data.department_id : null,
    };

    await createDispatchRequest.mutateAsync({
      data: formattedData,
      company: selectedCompany!.slug,
    })

    onClose()
  }

  const aeronauticalCount = aeroFA.fields.length
  const generalCount = genFA.fields.length

  const messageClass = (level: MsgLevel) => (level === "warn" ? "text-amber-600" : "text-destructive")

  const activeConversions = getActiveConversionList()

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
            <div className="flex flex-col gap-2 mt-2">
              <Label className="text-sm font-medium">Entregado por:</Label>
              <Input disabled value={`${user?.first_name} ${user?.last_name}`} />
            </div>
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Recibe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccione el responsable..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeesLoading || isEmployeesByDepartmentLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      { isDepartment && employeesByDepartment ? employeesByDepartment.map((e) => (
                        <SelectItem key={e.id} value={`${e.dni}`}>
                          {e.first_name} {e.last_name} - {e.job_title.name}
                        </SelectItem>
                      )) : employees?.map((employee) => (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="work_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Ord. de Trabajo</FormLabel>
                  <FormControl>
                    <Input className="h-10 w-full" placeholder="Ej: OT-000123" {...field} />
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
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha...</span>
                          )}
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

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2 gap-2">
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
                    value={field.value ?? ""} // controlado
                    onValueChange={(val) => {
                      field.onChange(val)

                      if (isDepartment) {
                        const dep = departments?.find((d) => d.id.toString() === val)
                        if(dep) {
                          setSelectedDepartment(dep)
                        }
                      } else {
                        setSelectedDepartment(null)
                      }
                    }}
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

        {/* Artículos a Retirar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Artículos a Retirar
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Selector único */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center justify-between">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Aeronáutico: {aeronauticalCount} · Ferretería: {generalCount}
              </span>
            </Label>

            <Popover open={openAdd} onOpenChange={setOpenAdd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAdd}
                  className="w-full justify-between h-10"
                  disabled={isBatchesLoading && isHardwareLoading}
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Seleccione un artículo...
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por parte, descripción, marca o tipo..." />
                  <CommandList>
                    <CommandEmpty>No se han encontrado artículos...</CommandEmpty>

                    {/* Aeronáutico */}
                    <div className="px-2 pt-2 pb-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Aeronáutico (Consumibles)
                      </p>
                    </div>

                    {isBatchesLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    ) : (
                      batches?.map((batch: BatchesWithCountProp) => (
                        <CommandGroup key={`aero-${batch.batch_id}`} heading={batch.name}>
                          {batch.articles.map((article) => (
                            <CommandItem
                              key={`a-${article.id}-${batch.batch_id}`}
                              value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                              onSelect={() => handleAddAeronautical(article)}
                            >
                              <Check className="mr-2 h-4 w-4 opacity-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{article.part_number}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {article.description ?? "Sin descripción"} · Disp: {article.quantity} {article.unit}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))
                    )}

                    {/* Ferretería */}
                    <CommandGroup heading="Ferretería (Inventario general)">
                      {isHardwareLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : (
                        hardwareArticles.map((ga) => (
                          <CommandItem
                            key={`g-${ga.id}`}
                            value={`${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`}
                            onSelect={() => handleAddGeneral(ga)}
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium truncate">{ga.description ?? "N/A"}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {ga.brand_model ?? "N/A"} · {ga.variant_type ?? "N/A"} · Disp: {ga.quantity ?? 0}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Aeronáutico */}
          {aeroFA.fields.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Aeronáutico
              </div>

              {aeroFA.fields.map((f, index) => {
                const key = aeroKey(f.id)
                const item = getValues(`aeronautical_articles.${index}`)
                const article = aeroById.get(item.article_id)
                const max = item.article_id ? getAeroMax(item.article_id) : 0

                const qty = qtyByKey[key] ?? ""
                const rowMsg = msgByKey[key]

                return (
                  <div key={f.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {article?.part_number ?? `ID: ${item.article_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {article?.description ?? "Sin descripción"} · Disponible: {article?.quantity ?? 0}{" "}
                          {article?.unit ?? ""}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeAeroRow(index, f.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm font-medium">Cantidad</Label>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setToMaxAero(index, f.id)}
                              className="h-7 text-xs text-primary hover:text-primary"
                              disabled={!article}
                            >
                              Usar máximo
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openConversionForAero(index, f.id, item.article_id)}
                              disabled={!article || article.unit === "u"}
                            >
                              <Calculator className="h-3.5 w-3.5 mr-2" />
                              Conversión
                            </Button>
                          </div>
                        </div>

                        <Input
                          type="text"
                          disabled={!article}
                          value={qty}
                          onChange={(e) => {
                            const next = sanitizeDecimal(e.target.value)
                            setQtyByKey((p) => ({ ...p, [key]: next }))
                          }}
                          onBlur={() => commitAeroQty(index, f.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              commitAeroQty(index, f.id)
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

                    {/* Panel Conversión (aero) */}
                    {conversionTarget === "aero" &&
                      conversionRowFieldId === f.id &&
                      article &&
                      article.unit !== "u" && (
                        <div className="mt-3 rounded-md bg-muted/30 p-3 space-y-2">
                          <Label className="text-sm font-medium">Conversión de Unidades</Label>

                          <div className="flex flex-col md:flex-row gap-2">
                            <Select
                              value={selectedConversion?.id?.toString() || ""}
                              onValueChange={(value) => {
                                const conv = activeConversions?.find((c: any) => c.id.toString() === value)
                                setSelectedConversion(conv || null)
                                setConversionInput("")
                              }}
                              disabled={isActiveConversionLoading}
                            >
                              <SelectTrigger className="h-10 flex-1">
                                <SelectValue
                                  placeholder={isActiveConversionLoading ? "Cargando..." : "Seleccione unidad"}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {activeConversions?.map((conv: any) => (
                                  <SelectItem key={conv.id} value={conv.id.toString()}>
                                    {conv.unit_primary.label} ({conv.unit_primary.value})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="Cantidad"
                              value={conversionInput}
                              onChange={(e) => setConversionInput(sanitizeDecimal(e.target.value))}
                              className="h-10 w-full md:w-28"
                              disabled={!selectedConversion}
                            />

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                className="h-10"
                                onClick={applyConversion}
                                disabled={!selectedConversion || !conversionInput}
                              >
                                Aplicar
                              </Button>
                              <Button type="button" variant="outline" className="h-10" onClick={closeConversion}>
                                Cerrar
                              </Button>
                            </div>
                          </div>

                          {selectedConversion && conversionInput && (
                            <p className="text-xs text-muted-foreground">
                              {conversionInput} {selectedConversion.unit_primary.label} ={" "}
                              {((parseFloat(conversionInput) || 0) / selectedConversion.equivalence).toFixed(6)}{" "}
                              {activeConversions?.[0]?.unit_secondary?.label || "unidades"}
                            </p>
                          )}

                          {!isActiveConversionLoading && (!activeConversions || activeConversions.length === 0) && (
                            <p className="text-xs text-muted-foreground">
                              No hay conversiones disponibles para este artículo.
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Ferretería */}
          {genFA.fields.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ferretería
              </div>

              {genFA.fields.map((f, index) => {
                const key = genKey(f.id)
                const item = getValues(`general_articles.${index}`)
                const ga = genById.get(item.general_article_id)
                const max = item.general_article_id ? getGenMax(item.general_article_id) : 0

                const qty = qtyByKey[key] ?? ""
                const rowMsg = msgByKey[key]

                return (
                  <div key={f.id} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {ga?.description ?? `ID: ${item.general_article_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ga?.brand_model ?? "N/A"} · {ga?.variant_type ?? "N/A"} · Disponible: {ga?.quantity ?? 0}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeGenRow(index, f.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm font-medium">Cantidad</Label>

                          <div className="flex items-center gap-2">
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

                            {/* ✅ Conversión también para ferretería */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => openConversionForGeneral(index, f.id, item.general_article_id)}
                              disabled={!ga}
                            >
                              <Calculator className="h-3.5 w-3.5 mr-2" />
                              Conversión
                            </Button>
                          </div>
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

                    {/* Panel Conversión (general) */}
                    {conversionTarget === "general" && conversionRowFieldId === f.id && ga && (
                      <div className="mt-3 rounded-md bg-muted/30 p-3 space-y-2">
                        <Label className="text-sm font-medium">Conversión de Unidades</Label>

                        <div className="flex flex-col md:flex-row gap-2">
                          <Select
                            value={selectedConversion?.id?.toString() || ""}
                            onValueChange={(value) => {
                              const conv = activeConversions?.find((c: any) => c.id.toString() === value)
                              setSelectedConversion(conv || null)
                              setConversionInput("")
                            }}
                            disabled={isActiveConversionLoading}
                          >
                            <SelectTrigger className="h-10 flex-1">
                              <SelectValue
                                placeholder={isActiveConversionLoading ? "Cargando..." : "Seleccione unidad"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {activeConversions?.map((conv: any) => (
                                <SelectItem key={conv.id} value={conv.id.toString()}>
                                  {conv.unit_primary.label} ({conv.unit_primary.value})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Cantidad"
                            value={conversionInput}
                            onChange={(e) => setConversionInput(sanitizeDecimal(e.target.value))}
                            className="h-10 w-full md:w-28"
                            disabled={!selectedConversion}
                          />

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="h-10"
                              onClick={applyConversion}
                              disabled={!selectedConversion || !conversionInput}
                            >
                              Aplicar
                            </Button>
                            <Button type="button" variant="outline" className="h-10" onClick={closeConversion}>
                              Cerrar
                            </Button>
                          </div>
                        </div>

                        {selectedConversion && conversionInput && (
                          <p className="text-xs text-muted-foreground">
                            {conversionInput} {selectedConversion.unit_primary.label} ={" "}
                            {((parseFloat(conversionInput) || 0) / selectedConversion.equivalence).toFixed(6)}{" "}
                            {activeConversions?.[0]?.unit_secondary?.label || "unidades"}
                          </p>
                        )}

                        {!isActiveConversionLoading && (!activeConversions || activeConversions.length === 0) && (
                          <p className="text-xs text-muted-foreground">
                            No hay conversiones disponibles para este artículo.
                          </p>
                        )}
                      </div>
                    )}
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
                  <Textarea
                    rows={4}
                    className="w-full resize-none"
                    placeholder="Ej: Se necesita para el mantenimiento..."
                    {...field}
                  />
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
            className="bg-primary text-white hover:bg-primary/90 disabled:bg-primary/70 min-w-[120px] h-10"
            disabled={
              createDispatchRequest?.isPending ||
              aeronauticalCount + generalCount === 0 ||
              hasBlockingQtyError ||
              hasInvalidQty
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
