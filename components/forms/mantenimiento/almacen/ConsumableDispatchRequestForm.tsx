"use client"

import { useCreateDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  UserCheck,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"
import type { Article, Batch, Department, GeneralArticle } from "@/types"

import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId"
import { useGetConversionByGeneralArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId"
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees"

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
    dispatch_type: z.enum(["aircraft", "department", "authorized"], {
      message: "Debe seleccionar el tipo de despacho.",
    }),
    requested_by: z.string(),
    submission_date: z.date({ message: "Debe ingresar la fecha." }),
    justification: z.string({ message: "Debe ingresar una justificación de la salida." }),
    department_id: z.string().optional(),
    status: z.string(),
    unit: z.enum(["litros", "mililitros"]).optional(),
    aircraft_id: z.string().optional(),
    authorized_employee_id: z.string().optional(),
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

const MSG_CLASS: Record<MsgLevel, string> = {
  error: "text-destructive",
  warn: "text-amber-600",
}

const DISPATCH_TYPES = [
  { value: "aircraft" as const, label: "Aeronave", icon: Plane },
  { value: "department" as const, label: "Departamento", icon: Building2 },
  { value: "authorized" as const, label: "Terceros", icon: UserCheck },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

interface ConversionPanelProps {
  conversions: any[] | undefined
  isLoading: boolean
  selectedConversion: any
  conversionInput: string
  onConversionChange: (conv: any) => void
  onInputChange: (val: string) => void
  onApply: () => void
  onClose: () => void
}

function ConversionPanel({
  conversions,
  isLoading,
  selectedConversion,
  conversionInput,
  onConversionChange,
  onInputChange,
  onApply,
  onClose,
}: ConversionPanelProps) {
  return (
    <div className="mt-3 rounded-md border border-dashed bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
          Conversión de Unidades
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
          Cerrar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <Select
          value={selectedConversion?.id?.toString() || ""}
          onValueChange={(value) => {
            const conv = conversions?.find((c: any) => c.id.toString() === value)
            onConversionChange(conv ?? null)
            onInputChange("")
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="h-10 flex-1">
            <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione unidad origen"} />
          </SelectTrigger>
          <SelectContent>
            {conversions?.map((conv: any) => (
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
          onChange={(e) => onInputChange(sanitizeDecimal(e.target.value))}
          className="h-10 w-full md:w-28"
          disabled={!selectedConversion}
        />

        <Button
          type="button"
          className="h-10 shrink-0"
          onClick={onApply}
          disabled={!selectedConversion || !conversionInput}
        >
          Aplicar
        </Button>
      </div>

      {selectedConversion && conversionInput && (
        <p className="text-xs text-muted-foreground">
          {conversionInput} {selectedConversion.unit_primary.label} ={" "}
          {((parseFloat(conversionInput) || 0) / selectedConversion.equivalence).toFixed(6)}{" "}
          {conversions?.[0]?.unit_secondary?.label ?? "unidades"}
        </p>
      )}

      {!isLoading && (!conversions || conversions.length === 0) && (
        <p className="text-xs text-muted-foreground">
          No hay conversiones disponibles para este artículo.
        </p>
      )}
    </div>
  )
}

interface ArticleRowCardProps {
  title: string
  subtitle: string
  qty: string
  max: number
  rowMsg: RowMsg
  disabled: boolean
  canConvert: boolean
  showConversionPanel: boolean
  conversionPanelNode: React.ReactNode
  accentClass: string
  onQtyChange: (val: string) => void
  onCommit: () => void
  onSetMax: () => void
  onOpenConversion: () => void
  onRemove: () => void
}

function ArticleRowCard({
  title,
  subtitle,
  qty,
  max,
  rowMsg,
  disabled,
  canConvert,
  showConversionPanel,
  conversionPanelNode,
  accentClass,
  onQtyChange,
  onCommit,
  onSetMax,
  onOpenConversion,
  onRemove,
}: ArticleRowCardProps) {
  return (
    <div className={cn("border rounded-md p-3 border-l-4", accentClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium">Cantidad</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSetMax}
              className="h-7 text-xs text-primary hover:text-primary"
              disabled={disabled}
            >
              Usar máximo
            </Button>
            {canConvert && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={onOpenConversion}
                disabled={disabled}
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Conversión
              </Button>
            )}
          </div>
        </div>

        <Input
          type="text"
          disabled={disabled}
          value={qty}
          onChange={(e) => onQtyChange(sanitizeDecimal(e.target.value))}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onCommit()
              ;(e.currentTarget as HTMLInputElement).blur()
            }
          }}
          placeholder={!disabled ? `Máx: ${max}` : "Ingrese la cantidad..."}
          className={cn(
            "h-10",
            rowMsg?.level === "error" && "border-destructive focus-visible:ring-destructive",
            rowMsg?.level === "warn" && "border-amber-500 focus-visible:ring-amber-500"
          )}
        />

        {rowMsg?.msg && (
          <div className={cn("flex items-center gap-1 text-xs", MSG_CLASS[rowMsg.level])}>
            <AlertCircle className="h-3 w-3 shrink-0" />
            {rowMsg.msg}
          </div>
        )}

        {max > 0 && <p className="text-[11px] text-muted-foreground">Disponible actual: {max}</p>}
      </div>

      {showConversionPanel && conversionPanelNode}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ConsumableDispatchForm({ onClose }: FormProps) {
  const { user } = useAuth()
  const { selectedStation, selectedCompany } = useCompanyStore()
  const [openAdd, setOpenAdd] = useState(false)
  const [addTab, setAddTab] = useState<"aero" | "general">("aero")
  const [openEmployee, setOpenEmployee] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  const { createDispatchRequest } = useCreateDispatchRequest()

  const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(
    selectedCompany?.slug
  )

  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(
    selectedCompany?.slug
  )

  const { data: authorizedEmployees, isLoading: isAuthorizedEmployeesLoading } =
    useGetAuthorizedEmployees(selectedCompany?.slug)

  const { data: batches, isPending: isBatchesLoading } = useGetBatchesWithInWarehouseArticles({
    location_id: Number(selectedStation!),
    company: selectedCompany!.slug,
    category: "consumable",
  })

  const { data: employees, isLoading: employeesLoading } = useGetEmployeesByCompany(selectedCompany?.slug)

  const { data: hardwareRes, isLoading: isHardwareLoading } = useGetGeneralArticles()
  const hardwareArticles = useMemo<GeneralArticle[]>(() => hardwareRes ?? [], [hardwareRes])

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

  const { control, setValue } = form
  const aeroFA = useFieldArray({ control, name: "aeronautical_articles" })
  const genFA = useFieldArray({ control, name: "general_articles" })

  // Watch arrays at top level — avoids repeated form.watch() calls in JSX
  const watchedAeroRaw = useWatch({ control, name: "aeronautical_articles" })
  const watchedGenRaw = useWatch({ control, name: "general_articles" })
  const dispatchType = useWatch({ control, name: "dispatch_type" })

  const watchedAero = useMemo(() => watchedAeroRaw ?? [], [watchedAeroRaw])
  const watchedGen = useMemo(() => watchedGenRaw ?? [], [watchedGenRaw])

  const aeroSelectedSet = useMemo(
    () => new Set(watchedAero.map((x) => Number(x.article_id))),
    [watchedAero]
  )

  const genSelectedSet = useMemo(
    () => new Set(watchedGen.map((x) => Number(x.general_article_id))),
    [watchedGen]
  )

  // O(1) lookups by id
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

  useEffect(() => {
    setValue("department_id", "")
    if (dispatchType === "authorized") setValue("requested_by", "")
  }, [dispatchType, setValue])

  // ── Quantity local draft state ──────────────────────────────────────────────
  const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({})
  const [msgByKey, setMsgByKey] = useState<Record<string, RowMsg>>({})

  const aeroKey = (fieldId: string) => `A:${fieldId}`
  const genKey = (fieldId: string) => `G:${fieldId}`

  const setRowMsg = (key: string, msg: RowMsg) =>
    setMsgByKey((p) => ({ ...p, [key]: msg }))

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
      const item = watchedAero[index]
      const max = item?.article_id ? getAeroMax(Number(item.article_id)) : 0
      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)
      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`aeronautical_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    },
    [qtyByKey, setValue, getAeroMax, validateAndClamp, watchedAero]
  )

  const commitGenQty = useCallback(
    (index: number, fieldId: string) => {
      const key = genKey(fieldId)
      const item = watchedGen[index]
      const max = item?.general_article_id ? getGenMax(Number(item.general_article_id)) : 0
      const raw = qtyByKey[key] ?? ""
      const adjusted = validateAndClamp(key, raw, max)
      setQtyByKey((p) => ({ ...p, [key]: adjusted }))
      setValue(`general_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    },
    [qtyByKey, setValue, getGenMax, validateAndClamp, watchedGen]
  )

  const clearRowState = useCallback((key: string) => {
    setQtyByKey((p) => { const n = { ...p }; delete n[key]; return n })
    setMsgByKey((p) => { const n = { ...p }; delete n[key]; return n })
  }, [])

  const setToMaxAero = (index: number, fieldId: string) => {
    const item = watchedAero[index]
    const max = item?.article_id ? getAeroMax(Number(item.article_id)) : 0
    const next = max > 0 ? String(max) : "0"
    setQtyByKey((p) => ({ ...p, [aeroKey(fieldId)]: next }))
    setRowMsg(aeroKey(fieldId), undefined)
    setValue(`aeronautical_articles.${index}.quantity`, parseFloat(next) || 0)
  }

  const setToMaxGen = (index: number, fieldId: string) => {
    const item = watchedGen[index]
    const max = item?.general_article_id ? getGenMax(Number(item.general_article_id)) : 0
    const next = max > 0 ? String(max) : "0"
    setQtyByKey((p) => ({ ...p, [genKey(fieldId)]: next }))
    setRowMsg(genKey(fieldId), undefined)
    setValue(`general_articles.${index}.quantity`, parseFloat(next) || 0)
  }

  // ── Conversion state ────────────────────────────────────────────────────────
  const [conversionTarget, setConversionTarget] = useState<ConversionTarget | null>(null)
  const [conversionRowFieldId, setConversionRowFieldId] = useState<string | null>(null)
  const [conversionRowIndex, setConversionRowIndex] = useState<number | null>(null)
  const [conversionArticleId, setConversionArticleId] = useState<number | null>(null)
  const [conversionGeneralArticleId, setConversionGeneralArticleId] = useState<number | null>(null)
  const [selectedConversion, setSelectedConversion] = useState<any>(null)
  const [conversionInput, setConversionInput] = useState("")

  const { data: aeroConversions, isLoading: isAeroConversionLoading } =
    useGetConversionByConsmable(conversionArticleId ?? null, selectedCompany?.slug)

  const { data: genConversions, isLoading: isGenConversionLoading } =
    useGetConversionByGeneralArticle(conversionGeneralArticleId ?? null, selectedCompany?.slug)

  const activeConversions = useMemo(
    () => (conversionTarget === "general" ? genConversions : aeroConversions),
    [conversionTarget, genConversions, aeroConversions]
  )

  const isActiveConversionLoading =
    conversionTarget === "general" ? isGenConversionLoading : isAeroConversionLoading

  const closeConversion = useCallback(() => {
    setConversionTarget(null)
    setConversionRowFieldId(null)
    setConversionRowIndex(null)
    setConversionArticleId(null)
    setConversionGeneralArticleId(null)
    setSelectedConversion(null)
    setConversionInput("")
  }, [])

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
      setQtyByKey((p) => ({ ...p, [key]: String(finalQuantity) }))
      setValue(`aeronautical_articles.${conversionRowIndex}.quantity`, finalQuantity)
      closeConversion()
      return
    }

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
    setQtyByKey((p) => ({ ...p, [key]: String(finalQuantity) }))
    setValue(`general_articles.${conversionRowIndex}.quantity`, finalQuantity)
    closeConversion()
  }

  // ── Add / remove items ──────────────────────────────────────────────────────
  const handleAddAeronautical = (article: Article) => {
    if (!article?.id) return
    const id = Number(article.id)
    if (aeroSelectedSet.has(id)) {
      const idx = watchedAero.findIndex((x) => Number(x.article_id) === id)
      if (idx >= 0 && aeroFA.fields[idx]) removeAeroRow(idx, aeroFA.fields[idx].id)
      setOpenAdd(false)
      return
    }
    aeroFA.append({ article_id: id, quantity: 0 })
    if (article.unit !== "u") setValue("unit", "litros")
    setOpenAdd(false)
  }

  const handleAddGeneral = (ga: GeneralArticle) => {
    if (!ga?.id) return
    const id = Number(ga.id)
    if (genSelectedSet.has(id)) {
      const idx = watchedGen.findIndex((x) => Number(x.general_article_id) === id)
      if (idx >= 0 && genFA.fields[idx]) removeGenRow(idx, genFA.fields[idx].id)
      setOpenAdd(false)
      return
    }
    genFA.append({ general_article_id: id, quantity: 0 })
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

  // ── Submit validation ───────────────────────────────────────────────────────
  const hasBlockingQtyError = useMemo(
    () => Object.values(msgByKey).some((m) => m?.level === "error"),
    [msgByKey]
  )

  const hasInvalidQty = useMemo(() => {
    const aeroInvalid = aeroFA.fields.some((f) => {
      const raw = qtyByKey[aeroKey(f.id)] ?? ""
      return (parseFloat(raw || "0") || 0) <= 0
    })
    const genInvalid = genFA.fields.some((f) => {
      const raw = qtyByKey[genKey(f.id)] ?? ""
      return (parseFloat(raw || "0") || 0) <= 0
    })
    return aeroInvalid || genInvalid
  }, [aeroFA.fields, genFA.fields, qtyByKey])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormSchemaType) => {
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
      aircraft_id: data.dispatch_type === "aircraft" ? data.aircraft_id : undefined,
      department_id: data.dispatch_type === "department" ? data.department_id : undefined,
    }

    await createDispatchRequest.mutateAsync({
      data: formattedData,
      company: selectedCompany!.slug,
    })

    onClose()
  }

  const aeronauticalCount = aeroFA.fields.length
  const generalCount = genFA.fields.length
  const disabledAdd = isBatchesLoading || isHardwareLoading

  // Shared conversion panel node — rendered inside whichever row is active
  const conversionPanelNode = (
    <ConversionPanel
      conversions={activeConversions}
      isLoading={isActiveConversionLoading}
      selectedConversion={selectedConversion}
      conversionInput={conversionInput}
      onConversionChange={setSelectedConversion}
      onInputChange={setConversionInput}
      onApply={applyConversion}
      onClose={closeConversion}
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">

        {/* Personal Responsable */}
        <div className="space-y-4">
          <SectionHeader label="Personal Responsable" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Entregado por</Label>
              <Input
                className="h-10"
                disabled
                value={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
              />
              <p className="text-xs text-muted-foreground">
                Usuario actual que registra la entrega.
              </p>
            </div>

            {dispatchType !== "authorized" ? (
              <FormField
                control={form.control}
                name="requested_by"
                render={({ field }) => {
                  const items = employees ?? []
                  const selected = items.find((e) => `${e.dni}` === field.value)

                  return (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium">Recibe</FormLabel>
                      <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openEmployee}
                              className={cn(
                                "h-10 w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selected
                                ? `${selected.first_name} ${selected.last_name}`
                                : "Seleccione el responsable..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          {employeesLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <Command>
                              <CommandInput placeholder="Buscar empleado..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                                <CommandGroup>
                                  {items.map((e) => (
                                    <CommandItem
                                      key={e.id}
                                      value={`${e.first_name} ${e.last_name} ${e.job_title?.name ?? ""}`}
                                      onSelect={() => {
                                        field.onChange(`${e.dni}`)
                                        setOpenEmployee(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 shrink-0",
                                          field.value === `${e.dni}` ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">
                                          {e.first_name} {e.last_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                          {e.job_title?.name ?? ""}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Listado general de empleados.</p>
                    </FormItem>
                  )
                }}
              />
            ) : (
              <div className="hidden md:flex items-center rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Para &quot;Terceros&quot; no se selecciona responsable interno en esta sección.
              </div>
            )}
          </div>
        </div>

        {/* Información de la Solicitud */}
        <div className="space-y-4">
          <SectionHeader label="Información de la Solicitud" />

          <div className="flex justify-center">
            <FormField
              control={form.control}
              name="dispatch_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-center mb-2">Tipo de Despacho</FormLabel>
                  <FormControl>
                    <div className="inline-flex rounded-lg border bg-muted/30 p-1 gap-1">
                      {DISPATCH_TYPES.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            field.value === value
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          {field.value
                            ? format(field.value, "PPP", { locale: es })
                            : <span>Seleccione una fecha...</span>}
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

            {dispatchType === "department" && (
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem className="mt-1">
                    <FormLabel className="text-sm font-medium">Departamento</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => {
                        field.onChange(val)
                        const dep = departments?.find((d) => d.id.toString() === val)
                        if (dep) setSelectedDepartment(dep)
                      }}
                      disabled={isDepartmentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccione un departamento..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {dispatchType === "aircraft" && (
              <FormField
                control={form.control}
                name="aircraft_id"
                render={({ field }) => (
                  <FormItem className="mt-1">
                    <FormLabel className="text-sm font-medium">Aeronave</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isAircraftsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccione una aeronave..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {dispatchType === "authorized" && (
              <FormField
                control={form.control}
                name="authorized_employee_id"
                render={({ field }) => (
                  <FormItem className="mt-1">
                    <FormLabel className="text-sm font-medium">Empleado Autorizado</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isAuthorizedEmployeesLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccione un empleado autorizado..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isAuthorizedEmployeesLoading && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        {authorizedEmployees?.map((a) => (
                          <SelectItem key={a.id} value={a.id.toString()}>
                            {a.employee_name} - {a.from_company_db.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Artículos a Retirar */}
        <div className="space-y-4">
          <SectionHeader label="Artículos a Retirar" />

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center justify-between">
              Agregar artículo
              <span className="text-xs text-muted-foreground">
                Aeronáutico: {aeronauticalCount} · Ferretería: {generalCount}
              </span>
            </Label>

            <Popover
              open={openAdd}
              onOpenChange={(v) => {
                setOpenAdd(v)
                if (v) setAddTab("aero")
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
                    {disabledAdd
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <PackagePlus className="h-4 w-4" />}
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
                      variant={addTab === "aero" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("aero")}
                    >
                      Aeronáutico
                      <span className="ml-2 text-xs opacity-80">({aeronauticalCount})</span>
                    </Button>
                    <Button
                      type="button"
                      variant={addTab === "general" ? "default" : "outline"}
                      className="h-8"
                      onClick={() => setAddTab("general")}
                    >
                      Ferretería
                      <span className="ml-2 text-xs opacity-80">({generalCount})</span>
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setOpenAdd(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Command>
                  <CommandInput
                    placeholder={
                      addTab === "aero"
                        ? "Buscar por lote, parte, serial o descripción..."
                        : "Buscar por descripción, modelo o tipo..."
                    }
                  />
                  <CommandList>
                    <CommandEmpty>No se han encontrado artículos...</CommandEmpty>

                    {addTab === "aero" ? (
                      isBatchesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : (
                        batches?.map((batch: BatchesWithCountProp) => (
                          <CommandGroup key={`aero-${batch.batch_id}`} heading={batch.name}>
                            {batch.articles.map((article) => {
                              const already = aeroSelectedSet.has(Number(article.id))
                              return (
                                <CommandItem
                                  key={`a-${article.id}-${batch.batch_id}`}
                                  value={`${batch.name} ${article.part_number} ${article.serial ?? ""} ${article.description ?? ""}`}
                                  onSelect={() => handleAddAeronautical(article)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", already ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium truncate">
                                      {article.part_number} {article.serial ? `· ${article.serial}` : ""}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">
                                      {article.description ?? "Sin descripción"} · Disp: {article.quantity} {article.unit}
                                    </span>
                                  </div>
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        ))
                      )
                    ) : isHardwareLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    ) : (
                      <CommandGroup heading="Inventario general">
                        {hardwareArticles.map((ga) => {
                          const already = genSelectedSet.has(Number(ga.id))
                          return (
                            <CommandItem
                              key={`g-${ga.id}`}
                              value={`${ga.description ?? ""} ${ga.brand_model ?? ""} ${ga.variant_type ?? ""}`}
                              onSelect={() => handleAddGeneral(ga)}
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

          {/* Empty state */}
          {aeronauticalCount === 0 && generalCount === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground">
              <PackagePlus className="h-8 w-8 opacity-40" />
              <p className="text-sm">Ningún artículo seleccionado.</p>
              <p className="text-xs opacity-70">Use el selector de arriba para agregar artículos.</p>
            </div>
          )}

          {/* Aeronáutico */}
          {aeroFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Aeronáutico
              </p>
              {aeroFA.fields.map((f, index) => {
                const key = aeroKey(f.id)
                const item = watchedAero[index]
                const articleId = Number(item?.article_id || 0)
                const article = articleId ? aeroById.get(articleId) : undefined
                const max = articleId ? getAeroMax(articleId) : 0

                return (
                  <ArticleRowCard
                    key={f.id}
                    title={article?.part_number ?? (articleId ? `ID: ${articleId}` : "Artículo")}
                    subtitle={`${article?.description ?? "Sin descripción"} · Disponible: ${article?.quantity ?? 0} ${article?.unit ?? ""}`}
                    qty={qtyByKey[key] ?? ""}
                    max={max}
                    rowMsg={msgByKey[key]}
                    disabled={!article}
                    canConvert={!!article && article.unit !== "u"}
                    showConversionPanel={
                      conversionTarget === "aero" &&
                      conversionRowFieldId === f.id &&
                      !!article &&
                      article.unit !== "u"
                    }
                    conversionPanelNode={conversionPanelNode}
                    accentClass="border-l-blue-500/50"
                    onQtyChange={(val) => setQtyByKey((p) => ({ ...p, [key]: val }))}
                    onCommit={() => commitAeroQty(index, f.id)}
                    onSetMax={() => setToMaxAero(index, f.id)}
                    onOpenConversion={() => openConversionForAero(index, f.id, articleId)}
                    onRemove={() => removeAeroRow(index, f.id)}
                  />
                )
              })}
            </div>
          )}

          {/* Ferretería */}
          {genFA.fields.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ferretería
              </p>
              {genFA.fields.map((f, index) => {
                const key = genKey(f.id)
                const item = watchedGen[index]
                const generalId = Number(item?.general_article_id || 0)
                const ga = generalId ? genById.get(generalId) : undefined
                const max = generalId ? getGenMax(generalId) : 0

                return (
                  <ArticleRowCard
                    key={f.id}
                    title={ga?.description ?? (generalId ? `ID: ${generalId}` : "Artículo")}
                    subtitle={`${ga?.brand_model ?? "N/A"} · ${ga?.variant_type ?? "N/A"} · Disponible: ${ga?.quantity ?? 0} ${ga?.general_primary_unit?.label ?? ""}`}
                    qty={qtyByKey[key] ?? ""}
                    max={max}
                    rowMsg={msgByKey[key]}
                    disabled={!ga}
                    canConvert={!!ga}
                    showConversionPanel={
                      conversionTarget === "general" &&
                      conversionRowFieldId === f.id &&
                      !!ga
                    }
                    conversionPanelNode={conversionPanelNode}
                    accentClass="border-l-amber-500/50"
                    onQtyChange={(val) => setQtyByKey((p) => ({ ...p, [key]: val }))}
                    onCommit={() => commitGenQty(index, f.id)}
                    onSetMax={() => setToMaxGen(index, f.id)}
                    onOpenConversion={() => openConversionForGeneral(index, f.id, generalId)}
                    onRemove={() => removeGenRow(index, f.id)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Justificación */}
        <div className="space-y-4">
          <SectionHeader label="Justificación" />
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
