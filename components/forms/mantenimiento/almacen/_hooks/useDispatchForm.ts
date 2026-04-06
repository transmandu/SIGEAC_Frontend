"use client"

import { useCreateDispatchRequest } from "@/actions/mantenimiento/almacen/solicitudes/salida/action"
import { useGetConversionByConsmable } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByConsumableId"
import { useGetConversionByGeneralArticle } from "@/hooks/mantenimiento/almacen/articulos/useGetConvertionsByGeneralArticleId"
import { useGetGeneralArticles } from "@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticles"
import { useGetBatchesWithInWarehouseArticles } from "@/hooks/mantenimiento/almacen/renglones/useGetBatchesWithInWarehouseArticles"
import { useGetAuthorizedEmployees } from "@/hooks/sistema/autorizados/useGetAuthorizedEmployees"
import { useGetDepartments } from "@/hooks/sistema/departamento/useGetDepartment"
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { useGetThirdParties } from "@/hooks/general/terceros/useGetThirdParties"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useCallback, useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import type { Article, Batch, Department, GeneralArticle, ThirdParty } from "@/types"

// ── Types ──────────────────────────────────────────────────────────────────────

interface BatchesWithCountProp extends Batch {
    articles: Article[]
    batch_id: number
}

export type MsgLevel = "error" | "warn"
export type RowMsg = { msg: string; level: MsgLevel } | undefined
export type ConversionTarget = "aero" | "general"
// Añadimos el tipo de categoría
export type ItemCategory = "consumable" | "component"

type ConvState = {
    target: ConversionTarget | null
    rowFieldId: string | null
    rowIndex: number | null
    articleId: number | null
    generalArticleId: number | null
    selected: any
    input: string
}

const CONV_INITIAL: ConvState = {
    target: null, rowFieldId: null, rowIndex: null,
    articleId: null, generalArticleId: null, selected: null, input: "",
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const AeronauticalItemSchema = z.object({
    article_id: z.coerce.number(),
    quantity: z.coerce.number(),
})

const GeneralItemSchema = z.object({
    general_article_id: z.coerce.number(),
    quantity: z.coerce.number(),
})

export const FormSchema = z
    .object({
        work_order: z.string(),
        dispatch_type: z.enum(["aircraft", "department", "authorized", "third_party"], {
            message: "Debe seleccionar el tipo de despacho.",
        }),
        requested_by: z.string(),
        third_party_requested_by: z.string().optional(),
        third_party_receiver: z.string().optional(),
        third_party_authorizer: z.string().optional(),
        submission_date: z.date({ message: "Debe ingresar la fecha." }),
        justification: z.string({ message: "Debe ingresar una justificación de la salida." }),
        department_id: z.string().optional(),
        status: z.string(),
        unit: z.enum(["litros", "mililitros"]).optional(),
        aircraft_id: z.string().optional(),
        authorized_employee_id: z.string().optional(),
        third_party_id: z.string().optional(),
        aeronautical_articles: z.array(AeronauticalItemSchema).default([]),
        general_articles: z.array(GeneralItemSchema).default([]),
    })
    .superRefine((data, ctx) => {
        const total = (data.aeronautical_articles?.length ?? 0) + (data.general_articles?.length ?? 0)
        if (total <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar al menos un artículo.", path: ["aeronautical_articles"] })
        }
    })
    .superRefine((data, ctx) => {
        if ((data.dispatch_type === "aircraft" || data.dispatch_type === "department") && !data.requested_by.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar quien recibe.", path: ["requested_by"] })
        }
        if (data.dispatch_type === "aircraft" && !data.aircraft_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar una aeronave.", path: ["aircraft_id"] })
        }
        if (data.dispatch_type === "department" && !data.department_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un departamento.", path: ["department_id"] })
        }
        if (data.dispatch_type === "authorized" && !data.authorized_employee_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un autorizado.", path: ["authorized_employee_id"] })
        }
        if (data.dispatch_type === "third_party" && !data.third_party_id) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe seleccionar un tercero.", path: ["third_party_id"] })
        }
    })

export type FormSchemaType = z.infer<typeof FormSchema>

// ── Key helpers (pure, module-level) ───────────────────────────────────────────

export const aeroKey = (id: string) => `A:${id}`
export const genKey = (id: string) => `G:${id}`

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useDispatchForm(
    onClose: () => void,
    itemCategory: ItemCategory = "consumable" // Por defecto consumible, pero se puede sobrescribir
) {
    const { user } = useAuth()
    const { selectedStation, selectedCompany } = useCompanyStore()

    const [openAdd, setOpenAdd] = useState(false)
    const [addTab, setAddTab] = useState<"aero" | "general">("aero")
    const [openEmployee, setOpenEmployee] = useState(false)
    const [openThirdParty, setOpenThirdParty] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [qtyByKey, setQtyByKey] = useState<Record<string, string>>({})
    const [msgByKey, setMsgByKey] = useState<Record<string, RowMsg>>({})
    const [convState, setConvState] = useState<ConvState>(CONV_INITIAL)

    const { createDispatchRequest } = useCreateDispatchRequest()

    const { data: departments, isLoading: isDepartmentsLoading } = useGetDepartments(selectedCompany?.slug)
    const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(selectedCompany?.slug)
    const { data: authorizedEmployees, isLoading: isAuthorizedEmployeesLoading } = useGetAuthorizedEmployees(selectedCompany?.slug)
    const { data: thirdParties, isLoading: isThirdPartiesLoading } = useGetThirdParties()

    // 1. Usamos el parámetro dinámico `itemCategory` para la búsqueda
    const { data: batches, isPending: isBatchesLoading } = useGetBatchesWithInWarehouseArticles({
        location_id: Number(selectedStation!),
        company: selectedCompany!.slug,
        category: itemCategory,
    })

    const { data: employees, isLoading: employeesLoading } = useGetEmployeesByCompany(selectedCompany?.slug)
    const { data: hardwareRes, isLoading: isHardwareLoading } = useGetGeneralArticles()
    const hardwareArticles = useMemo<GeneralArticle[]>(() => hardwareRes ?? [], [hardwareRes])

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            work_order: "",
            justification: "",
            requested_by: "",
            department_id: "",
            third_party_id: "",
            status: "proceso",
            aeronautical_articles: [],
            general_articles: [],
        },
    })

    const { control, setValue } = form
    const aeroFA = useFieldArray({ control, name: "aeronautical_articles" })
    const genFA = useFieldArray({ control, name: "general_articles" })

    const watchedAeroRaw = useWatch({ control, name: "aeronautical_articles" })
    const watchedGenRaw = useWatch({ control, name: "general_articles" })
    const dispatchType = useWatch({ control, name: "dispatch_type" })
    const thirdPartyId = useWatch({ control, name: "third_party_id" })

    const watchedAero = useMemo(() => watchedAeroRaw ?? [], [watchedAeroRaw])
    const watchedGen = useMemo(() => watchedGenRaw ?? [], [watchedGenRaw])

    const aeroSelectedSet = useMemo(() => new Set(watchedAero.map((x) => Number(x.article_id))), [watchedAero])
    const genSelectedSet = useMemo(() => new Set(watchedGen.map((x) => Number(x.general_article_id))), [watchedGen])

    const aeroById = useMemo(() => {
        const map = new Map<number, Article>()
        batches?.forEach((b: BatchesWithCountProp) =>
            b.articles?.forEach((a) => { if (a?.id != null) map.set(a.id, a) })
        )
        return map
    }, [batches])

    const genById = useMemo(() => {
        const map = new Map<number, GeneralArticle>()
        hardwareArticles.forEach((a) => map.set(a.id, a))
        return map
    }, [hardwareArticles])

    const getAeroMax = useCallback((id: number) => aeroById.get(id)?.quantity || 0, [aeroById])
    const getGenMax = useCallback((id: number) => genById.get(id)?.quantity || 0, [genById])

    const internalReceiverRequired = dispatchType === "aircraft" || dispatchType === "department"

    const selectedThirdParty = useMemo(
        () => thirdParties?.find((p) => p.id.toString() === thirdPartyId) ?? null,
        [thirdParties, thirdPartyId]
    )

    const groupedThirdParties = useMemo(() => {
        const groups = new Map<string, ThirdParty[]>()
            ; (thirdParties ?? []).forEach((p) => {
                const key = p.type || "SIN TIPO"
                const cur = groups.get(key) ?? []
                cur.push(p)
                groups.set(key, cur)
            })
        return Array.from(groups.entries())
    }, [thirdParties])

    const setRowMsg = useCallback((key: string, msg: RowMsg) =>
        setMsgByKey((p) => ({ ...p, [key]: msg })), [])

    const validateAndClamp = useCallback((key: string, raw: string, max: number) => {
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
    }, [setRowMsg])

    const commitAeroQty = useCallback((index: number, fieldId: string) => {
        const key = aeroKey(fieldId)
        const max = watchedAero[index]?.article_id ? getAeroMax(Number(watchedAero[index].article_id)) : 0
        const raw = qtyByKey[key] ?? ""
        const adjusted = validateAndClamp(key, raw, max)
        setQtyByKey((p) => ({ ...p, [key]: adjusted }))
        setValue(`aeronautical_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    }, [qtyByKey, setValue, getAeroMax, validateAndClamp, watchedAero])

    const commitGenQty = useCallback((index: number, fieldId: string) => {
        const key = genKey(fieldId)
        const max = watchedGen[index]?.general_article_id ? getGenMax(Number(watchedGen[index].general_article_id)) : 0
        const raw = qtyByKey[key] ?? ""
        const adjusted = validateAndClamp(key, raw, max)
        setQtyByKey((p) => ({ ...p, [key]: adjusted }))
        setValue(`general_articles.${index}.quantity`, parseFloat(adjusted || "0") || 0)
    }, [qtyByKey, setValue, getGenMax, validateAndClamp, watchedGen])

    const clearRowState = useCallback((key: string) => {
        setQtyByKey((p) => { const n = { ...p }; delete n[key]; return n })
        setMsgByKey((p) => { const n = { ...p }; delete n[key]; return n })
    }, [])

    const setToMaxAero = useCallback((index: number, fieldId: string) => {
        const max = watchedAero[index]?.article_id ? getAeroMax(Number(watchedAero[index].article_id)) : 0
        const next = max > 0 ? String(max) : "0"
        const key = aeroKey(fieldId)
        setQtyByKey((p) => ({ ...p, [key]: next }))
        setRowMsg(key, undefined)
        setValue(`aeronautical_articles.${index}.quantity`, parseFloat(next) || 0)
    }, [watchedAero, getAeroMax, setRowMsg, setValue])

    const setToMaxGen = useCallback((index: number, fieldId: string) => {
        const max = watchedGen[index]?.general_article_id ? getGenMax(Number(watchedGen[index].general_article_id)) : 0
        const next = max > 0 ? String(max) : "0"
        const key = genKey(fieldId)
        setQtyByKey((p) => ({ ...p, [key]: next }))
        setRowMsg(key, undefined)
        setValue(`general_articles.${index}.quantity`, parseFloat(next) || 0)
    }, [watchedGen, getGenMax, setRowMsg, setValue])

    // ── Conversion (7 states → 1) ─────────────────────────────────────────────

    // 2. Desactivamos la petición de conversiones para aeronáuticos si no es consumible
    const { data: aeroConversions, isLoading: isAeroConversionLoading } =
        useGetConversionByConsmable(
            itemCategory === "consumable" ? convState.articleId : null,
            selectedCompany?.slug
        )

    const { data: genConversions, isLoading: isGenConversionLoading } =
        useGetConversionByGeneralArticle(convState.generalArticleId, selectedCompany?.slug)

    const activeConversions = convState.target === "general" ? genConversions : aeroConversions
    const isActiveConversionLoading = convState.target === "general" ? isGenConversionLoading : isAeroConversionLoading

    const closeConversion = useCallback(() => setConvState(CONV_INITIAL), [])

    const openConversionForAero = useCallback((index: number, fieldId: string, articleId: number) => {
        // Si no es consumible, no abrimos el dialog de conversión
        if (itemCategory !== "consumable") return

        setConvState({ target: "aero", rowFieldId: fieldId, rowIndex: index, articleId, generalArticleId: null, selected: null, input: "" })
    }, [itemCategory])

    const openConversionForGeneral = useCallback((index: number, fieldId: string, generalArticleId: number) => {
        setConvState({ target: "general", rowFieldId: fieldId, rowIndex: index, generalArticleId, articleId: null, selected: null, input: "" })
    }, [])

    const applyConversion = useCallback(() => {
        const { rowIndex, rowFieldId, target, articleId, generalArticleId, selected, input } = convState
        if (rowIndex == null || rowFieldId == null || !target || !selected || !input) return

        const result = Number(((parseFloat(input) || 0) / selected.equivalence).toFixed(6))

        if (target === "aero" && articleId != null) {
            const max = getAeroMax(articleId)
            const finalQty = max > 0 && result > max ? max : result
            const key = aeroKey(rowFieldId)
            setRowMsg(key, max > 0 && result > max ? { msg: `Conversión: se ajustó al máximo disponible (${max}).`, level: "warn" } : undefined)
            setQtyByKey((p) => ({ ...p, [key]: String(finalQty) }))
            setValue(`aeronautical_articles.${rowIndex}.quantity`, finalQty)
        } else if (generalArticleId != null) {
            const max = getGenMax(generalArticleId)
            const finalQty = max > 0 && result > max ? max : result
            const key = genKey(rowFieldId)
            setRowMsg(key, max > 0 && result > max ? { msg: `Conversión: se ajustó al máximo disponible (${max}).`, level: "warn" } : undefined)
            setQtyByKey((p) => ({ ...p, [key]: String(finalQty) }))
            setValue(`general_articles.${rowIndex}.quantity`, finalQty)
        }
        closeConversion()
    }, [convState, getAeroMax, getGenMax, setRowMsg, setValue, closeConversion])

    // ── Article add/remove ────────────────────────────────────────────────────

    const removeAeroRow = useCallback((index: number, fieldId: string) => {
        aeroFA.remove(index)
        clearRowState(aeroKey(fieldId))
        if (convState.target === "aero" && convState.rowFieldId === fieldId) closeConversion()
    }, [aeroFA, clearRowState, convState, closeConversion])

    const removeGenRow = useCallback((index: number, fieldId: string) => {
        genFA.remove(index)
        clearRowState(genKey(fieldId))
        if (convState.target === "general" && convState.rowFieldId === fieldId) closeConversion()
    }, [genFA, clearRowState, convState, closeConversion])

    const handleAddAeronautical = useCallback((article: Article) => {
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
    }, [aeroSelectedSet, watchedAero, aeroFA, removeAeroRow, setValue])

    const handleAddGeneral = useCallback((ga: GeneralArticle) => {
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
    }, [genSelectedSet, watchedGen, genFA, removeGenRow])

    // ── rerender-move-effect-to-event: dispatch type reset ────────────────────

    const handleDispatchTypeChange = useCallback((value: string, fieldOnChange: (v: string) => void) => {
        fieldOnChange(value)
        if (value !== "department") { setValue("department_id", ""); setSelectedDepartment(null) }
        if (value !== "aircraft") setValue("aircraft_id", "")
        if (value !== "authorized") setValue("authorized_employee_id", "")
        if (value !== "third_party") { setValue("third_party_id", ""); setOpenThirdParty(false) }
        if (value !== "aircraft" && value !== "department") { setValue("requested_by", ""); setOpenEmployee(false) }
    }, [setValue])

    // ── Validation ────────────────────────────────────────────────────────────

    const hasBlockingQtyError = useMemo(
        () => Object.values(msgByKey).some((m) => m?.level === "error"),
        [msgByKey]
    )

    const hasInvalidQty = useMemo(() => {
        const aeroInvalid = aeroFA.fields.some((f) => (parseFloat(qtyByKey[aeroKey(f.id)] ?? "0") || 0) <= 0)
        const genInvalid = genFA.fields.some((f) => (parseFloat(qtyByKey[genKey(f.id)] ?? "0") || 0) <= 0)
        return aeroInvalid || genInvalid
    }, [aeroFA.fields, genFA.fields, qtyByKey])

    // ── Submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (data: FormSchemaType) => {
        for (let i = 0; i < data.aeronautical_articles.length; i++) {
            const item = data.aeronautical_articles[i]
            const max = getAeroMax(item.article_id)
            const key = aeroFA.fields[i]?.id ? aeroKey(aeroFA.fields[i].id) : null
            if (item.quantity <= 0) { if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" }); return }
            if (max > 0 && item.quantity > max) { if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" }); return }
        }
        for (let i = 0; i < data.general_articles.length; i++) {
            const item = data.general_articles[i]
            const max = getGenMax(item.general_article_id)
            const key = genFA.fields[i]?.id ? genKey(genFA.fields[i].id) : null
            if (item.quantity <= 0) { if (key) setRowMsg(key, { msg: "La cantidad debe ser mayor a 0", level: "error" }); return }
            if (max > 0 && item.quantity > max) { if (key) setRowMsg(key, { msg: `No puede exceder el disponible (${max})`, level: "error" }); return }
        }
        if (hasBlockingQtyError) return

        await createDispatchRequest.mutateAsync({
            data: {
                ...data,
                created_by: user!.username,
                submission_date: format(data.submission_date, "yyyy-MM-dd"),
                // 3. Modificamos la categoría basándonos en el tipo de componente a crear
                category: itemCategory === "consumable" ? "consumible" : "componente",
                status: "APROBADO",
                approved_by: user?.employee?.[0]?.dni,
                delivered_by: user?.employee?.[0]?.dni,
                user_id: Number(user!.id),
                aircraft_id: data.dispatch_type === "aircraft" ? data.aircraft_id : undefined,
                department_id: data.dispatch_type === "department" ? data.department_id : undefined,
            },
            company: selectedCompany!.slug,
        })
        onClose()
    }

    return {
        form,
        user,
        onSubmit,
        createDispatchRequest,
        // open states
        openAdd, setOpenAdd,
        addTab, setAddTab,
        openEmployee, setOpenEmployee,
        openThirdParty, setOpenThirdParty,
        selectedDepartment, setSelectedDepartment,
        // data queries
        departments, isDepartmentsLoading,
        aircrafts, isAircraftsLoading,
        authorizedEmployees, isAuthorizedEmployeesLoading,
        thirdParties, isThirdPartiesLoading,
        batches, isBatchesLoading,
        employees, employeesLoading,
        hardwareArticles, isHardwareLoading,
        // derived
        dispatchType,
        internalReceiverRequired,
        selectedThirdParty,
        groupedThirdParties,
        // field arrays
        aeroFA, genFA,
        watchedAero, watchedGen,
        aeroSelectedSet, genSelectedSet,
        aeroById, genById,
        getAeroMax, getGenMax,
        // qty state
        qtyByKey, setQtyByKey,
        msgByKey,
        // qty handlers
        commitAeroQty, commitGenQty,
        setToMaxAero, setToMaxGen,
        // conversion
        convState, setConvState,
        activeConversions, isActiveConversionLoading,
        closeConversion,
        openConversionForAero, openConversionForGeneral,
        applyConversion,
        // article handlers
        handleAddAeronautical, handleAddGeneral,
        removeAeroRow, removeGenRow,
        handleDispatchTypeChange,
        // validation flags
        hasBlockingQtyError, hasInvalidQty,
        aeronauticalCount: aeroFA.fields.length,
        generalCount: genFA.fields.length,
        disabledAdd: isBatchesLoading || isHardwareLoading,

        // 4. Exportamos variables útiles para que la UI sepa cómo comportarse
        itemCategory,
        needsConversion: itemCategory === "consumable",
    }
}
