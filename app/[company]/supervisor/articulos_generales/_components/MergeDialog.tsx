"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    useCombinedCostHistory,
    useMergeGeneralArticles,
    useMergePreview,
} from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { cn } from "@/lib/utils"
import type {
    CostChangeEdits,
    MergePreview,
    MergeRequest,
    SupervisorGeneralArticle,
} from "@/types/supervisor"
import { AlertTriangle, ArrowRight, Loader2, Merge, ReceiptText } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CostHistoryDialog } from "./CostHistoryDialog"
import { DecimalInput } from "./DecimalInput"
import SupervisorActionButton from "./SupervisorActionButton"
import { dependencyBadgeCls, formatQuantity } from "./utils/uiHelpers"

const CHILD_TABLE_LABELS: Record<string, string> = {
    general_article_intakes: "Entradas de compra",
    general_article_cost_changes: "Cambios de costo",
    general_articles_conversions: "Conversiones",
    articles_dispatch_orders: "Despachos",
}

/** Encabezado de sección con línea divisoria, igual que InfoSection en compras. */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 select-none">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                {children}
            </span>
            <div className="h-px flex-1 bg-border/50" />
        </div>
    )
}

/** Label micro-tipográfico sobre un campo. */
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <Label
            htmlFor={htmlFor}
            className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 select-none"
        >
            {children}
        </Label>
    )
}

/**
 * Asistente de fusión.
 *
 * Flujo en dos pasos deliberado: el supervisor define el resultado y solo
 * después ve la previsualización calculada por el backend. Confirmar sin haber
 * visto el preview no es posible — la fusión mueve stock e historial entre
 * artículos y el cálculo de cantidades depende de conversiones que no son
 * obvias a ojo.
 */
export function MergeDialog({
    open,
    onOpenChange,
    articles,
    onMerged,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    articles: SupervisorGeneralArticle[]
    onMerged: () => void
}) {
    const [survivorId, setSurvivorId] = useState<number | null>(null)
    const [description, setDescription] = useState("")
    const [brandModel, setBrandModel] = useState("")
    const [variantType, setVariantType] = useState("")
    const [unitId, setUnitId] = useState<number | null>(null)
    const [declaredConversions, setDeclaredConversions] = useState<Record<number, string>>({})
    /**
     * Equivalencias que se enviaron en la petición que produjo el preview
     * actual. Permite distinguir "el usuario acaba de escribir esto" de "esto
     * ya está reflejado en el cálculo mostrado" (ver conversionsDirty).
     */
    const [appliedConversions, setAppliedConversions] = useState<Record<number, string>>({})
    const [preview, setPreview] = useState<MergePreview | null>(null)
    /**
     * Ediciones del historial de costo pendientes. No se escriben al aplicarlas
     * en su diálogo: viajan en el payload y se persisten en la misma
     * transacción que la fusión, así que cancelar el merge las descarta.
     */
    const [costEdits, setCostEdits] = useState<CostChangeEdits>({})
    const [costDialogOpen, setCostDialogOpen] = useState(false)

    const { mergePreview } = useMergePreview()
    const { mergeGeneralArticles } = useMergeGeneralArticles()

    // Historial combinado del grupo, independiente del preview: el editor de
    // costos debe funcionar desde que se abre el asistente.
    const articleIds = useMemo(() => articles.map((article) => article.id), [articles])
    const { data: combinedCost, isLoading: isLoadingCost } = useCombinedCostHistory(
        articleIds,
        open,
    )

    // El preview, si existe, trae el historial ya proyectado con las ediciones
    // pendientes; si no, se usa el combinado sin proyectar.
    const costHistory = preview?.cost_history ?? combinedCost?.cost_history ?? []

    /**
     * Costo vigente del superviviente ELEGIDO, derivado de su propio historial.
     * Se calcula aquí y no se toma de combinedCost.current_cost (que es el del
     * grupo entero) para que cambiar de superviviente actualice la cifra al
     * instante, sin esperar al preview.
     */
    const survivorCurrentCost = useMemo(() => {
        const own = (combinedCost?.cost_history ?? []).filter(
            (entry) => entry.general_article_id === survivorId,
        )

        // El historial ya viene ordenado desc por fecha desde el backend.
        return Number(own[0]?.cost ?? 0)
    }, [combinedCost, survivorId])

    /**
     * Adopta un artículo como base del resultado: sus datos y su unidad pasan a
     * ser los valores finales propuestos.
     *
     * Elegir superviviente no es solo marcar cuál fila sobrevive — es decidir
     * de cuál se hereda la identidad. Por eso al cambiarlo se reajusta todo, y
     * se descartan las equivalencias declaradas: estaban expresadas hacia la
     * unidad del superviviente anterior y no significan lo mismo con otra base.
     */
    const adoptAsBase = useCallback((base: SupervisorGeneralArticle) => {
        setSurvivorId(base.id)
        setDescription(base.description)
        setBrandModel(base.brand_model ?? "")
        setVariantType(base.variant_type ?? "")
        setUnitId(base.primary_unit_id)
        setDeclaredConversions({})
        setAppliedConversions({})
        setPreview(null)
    }, [])

    // Al abrir, propone como superviviente el artículo con más entradas
    // confirmadas: es el que más historial real acumula y por tanto el que
    // menos se pierde de vista si algo sale mal.
    useEffect(() => {
        if (!open || articles.length === 0) return

        const best = [...articles].sort((a, b) => b.intakes_count - a.intakes_count)[0]

        adoptAsBase(best)
        // Las ediciones de costo sí se reinician al abrir (no al cambiar de
        // superviviente): apuntan a registros concretos del historial, que
        // sigue siendo el mismo grupo aunque cambie cuál fila sobrevive.
        setCostEdits({})
    }, [open, articles, adoptAsBase])

    // Cambiar la definición del resultado invalida el preview: obliga a
    // recalcular antes de confirmar, para que nunca se ejecute algo distinto a
    // lo visto. Las equivalencias declaradas NO entran aquí a propósito —
    // teclear un valor no debe borrar el preview bajo los pies del usuario;
    // ese caso lo maneja conversionsDirty más abajo.
    useEffect(() => {
        setPreview(null)
        setAppliedConversions({})
    }, [description, brandModel, variantType, unitId])

    const units = useMemo(() => {
        const map = new Map<number, string>()
        articles.forEach((article) => {
            if (article.general_primary_unit) {
                map.set(article.primary_unit_id, article.general_primary_unit.label)
            }
        })
        return Array.from(map, ([id, label]) => ({ id, label }))
    }, [articles])

    const unitLabel = (id: number | null) =>
        units.find((unit) => unit.id === id)?.label ?? ""

    /**
     * Unidades que hay que convertir a la unidad final, deducidas en el cliente
     * a partir de la selección. No dependen del preview: en cuanto el
     * supervisor abre el diálogo (o cambia la unidad final) ya sabe que hay
     * algo que convertir, sin tener que pedir un cálculo al backend primero.
     *
     * El backend sigue siendo la autoridad sobre CUÁLES de estas ya tienen una
     * Conversion registrada — eso llega en preview.missing_conversions y solo
     * entonces se pide la equivalencia.
     */
    const unitsToConvert = useMemo(() => {
        if (!unitId) return []

        const seen = new Map<number, { unitId: number; label: string; articles: string[] }>()

        articles
            .filter((article) => article.primary_unit_id !== unitId)
            .forEach((article) => {
                const entry = seen.get(article.primary_unit_id)
                const name = article.description

                if (entry) {
                    entry.articles.push(name)
                } else {
                    seen.set(article.primary_unit_id, {
                        unitId: article.primary_unit_id,
                        label: article.general_primary_unit?.label ?? "—",
                        articles: [name],
                    })
                }
            })

        return Array.from(seen.values())
    }, [articles, unitId])

    /**
     * Unidades que el backend confirmó que no tienen Conversion registrada y
     * por tanto exigen que el supervisor declare la equivalencia a mano.
     * Mientras no haya preview no sabemos cuáles son, así que se asumen todas
     * las de unitsToConvert como "por confirmar".
     */
    const missingUnitIds = useMemo(
        () => new Set((preview?.missing_conversions ?? []).map((missing) => missing.from_unit_id)),
        [preview],
    )

    /**
     * Hay equivalencias escritas que el preview mostrado todavía no incorpora.
     * En ese caso el cálculo está desactualizado y confirmar queda bloqueado
     * hasta recalcular — pero sin borrar lo ya visto mientras se escribe.
     */
    const conversionsDirty = useMemo(() => {
        if (!preview) return false

        return unitsToConvert.some((entry) => {
            const current = declaredConversions[entry.unitId]?.trim() ?? ""
            const applied = appliedConversions[entry.unitId]?.trim() ?? ""

            // Un valor a medio escribir ("1.") no cuenta como cambio pendiente:
            // el backend lo ignoraría igual.
            if (current !== "" && !(Number(current) > 0)) return false

            return current !== applied
        })
    }, [preview, unitsToConvert, declaredConversions, appliedConversions])

    const buildPayload = (): MergeRequest => ({
        survivor_id: survivorId!,
        absorbed_ids: articles
            .filter((article) => article.id !== survivorId)
            .map((article) => article.id),
        final: {
            description: description.trim(),
            brand_model: brandModel.trim(),
            variant_type: variantType.trim(),
            ...(unitId ? { primary_unit_id: unitId } : {}),
        },
        conversions: Object.entries(declaredConversions).reduce<Record<number, number>>(
            (acc, [key, value]) => {
                const parsed = Number(value)
                if (Number.isFinite(parsed) && parsed > 0) acc[Number(key)] = parsed
                return acc
            },
            {},
        ),
        cost_changes: costEdits,
    })

    /** Cuántas ediciones de historial hay pendientes, para el contador del botón. */
    const pendingCostEdits =
        (costEdits.created?.length ?? 0) +
        (costEdits.updated?.length ?? 0) +
        (costEdits.deleted?.length ?? 0)

    const handlePreview = async () => {
        // Se congela lo enviado junto al resultado: es contra esta foto que se
        // detecta si el usuario cambió algo después (ver conversionsDirty).
        const sent = { ...declaredConversions }
        const result = await mergePreview.mutateAsync(buildPayload())

        setPreview(result)
        setAppliedConversions(sent)
    }

    const handleMerge = async () => {
        await mergeGeneralArticles.mutateAsync(buildPayload())
        onOpenChange(false)
        onMerged()
    }

    if (articles.length < 2) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2.5">
                        <Merge className="size-5 text-muted-foreground/70" />
                        Fusionar artículos generales
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        El artículo superviviente concentrará el stock, las conversiones, el
                        historial de costo y los despachos de todo el grupo. Los demás quedan
                        archivados y la fusión se puede deshacer.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-1">

                    {/* ── Superviviente ─────────────────────────────────────── */}
                    <section className="flex flex-col gap-3">
                        <SectionLabel>Artículo que sobrevive</SectionLabel>

                        <RadioGroup
                            value={String(survivorId ?? "")}
                            onValueChange={(value) => {
                                const base = articles.find(
                                    (article) => article.id === Number(value),
                                )

                                if (base) adoptAsBase(base)
                            }}
                            className="flex flex-col gap-1.5"
                        >
                            {articles.map((article) => {
                                const isSurvivor = article.id === survivorId

                                return (
                                    <label
                                        key={article.id}
                                        htmlFor={`survivor-${article.id}`}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors duration-150",
                                            isSurvivor
                                                ? "border-sky-400/50 bg-sky-500/[0.06] dark:border-sky-300/30"
                                                : "border-border/60 bg-background/70 hover:bg-muted/30",
                                        )}
                                    >
                                        <RadioGroupItem
                                            value={String(article.id)}
                                            id={`survivor-${article.id}`}
                                            className="shrink-0"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">
                                                {article.description}
                                            </div>
                                            <div className="truncate text-[11px] text-muted-foreground/70">
                                                {article.brand_model || "Sin marca"}
                                                {article.variant_type ? ` · ${article.variant_type}` : ""}
                                            </div>
                                        </div>

                                        <span className={dependencyBadgeCls()}>
                                            {article.intakes_count} entradas
                                        </span>

                                        <div className="flex flex-col items-end shrink-0 min-w-[84px]">
                                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/60 select-none">
                                                Cantidad
                                            </span>
                                            <span className="text-sm font-medium tabular-nums">
                                                {formatQuantity(article.quantity)}{" "}
                                                <span className="text-muted-foreground/70 font-normal">
                                                    {article.general_primary_unit?.label ?? ""}
                                                </span>
                                            </span>
                                        </div>
                                    </label>
                                )
                            })}
                        </RadioGroup>
                    </section>

                    {/* ── Valores finales ───────────────────────────────────── */}
                    <section className="flex flex-col gap-3">
                        <SectionLabel>Resultado final</SectionLabel>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <FieldLabel htmlFor="merge-description">Descripción</FieldLabel>
                                <Input
                                    id="merge-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="merge-brand">Marca / Modelo</FieldLabel>
                                <Input
                                    id="merge-brand"
                                    value={brandModel}
                                    onChange={(event) => setBrandModel(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="merge-variant">Present. / Especif.</FieldLabel>
                                <Input
                                    id="merge-variant"
                                    value={variantType}
                                    onChange={(event) => setVariantType(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel>Unidad</FieldLabel>
                                <Select
                                    value={String(unitId ?? "")}
                                    onValueChange={(value) => setUnitId(Number(value))}
                                >
                                    <SelectTrigger className="h-9 bg-background/70 border-border/60">
                                        <SelectValue placeholder="Seleccione unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                {unit.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* ── Conversión de unidades ──────────────────────────────
                        Aparece en cuanto hay artículos en otra unidad, sin
                        esperar al preview: que haya algo que convertir se sabe
                        con solo mirar la selección.

                        No usa rojo/ámbar de alarma: no es un error del
                        supervisor, solo un dato que falta y que puede aportar
                        aquí mismo. */}
                    {unitsToConvert.length > 0 && (
                        <section className="rounded-xl border border-sky-400/40 bg-sky-500/[0.07] dark:border-sky-300/25 p-4 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-2">
                                <AlertTriangle className="size-4 text-sky-600 dark:text-sky-400 shrink-0" />
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                                    Conversión de unidades
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                {preview
                                    ? "Indique cuántas unidades finales equivale 1 unidad de origen. Al terminar, recalcule para ver el resultado."
                                    : `Hay artículos en otra unidad. Previsualice para comprobar si ya existe una conversión registrada hacia ${unitLabel(unitId) || "la unidad final"}.`}
                            </p>

                            <div className="flex flex-col gap-2">
                                {unitsToConvert.map((entry) => {
                                    const declared = declaredConversions[entry.unitId]?.trim()

                                    // El input se mantiene mientras el supervisor haya
                                    // escrito una equivalencia, aunque el recálculo ya la
                                    // haya sacado de missing_conversions: el valor es
                                    // suyo y debe poder corregirlo hasta confirmar.
                                    // Antes del preview tampoco sabemos si el backend ya
                                    // tiene la conversión, así que se pide igual.
                                    const needsInput =
                                        !preview || missingUnitIds.has(entry.unitId) || !!declared

                                    return (
                                        <div
                                            key={entry.unitId}
                                            className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-sm"
                                        >
                                            <span className="text-muted-foreground shrink-0">
                                                1 {entry.label}
                                            </span>
                                            <span className="text-muted-foreground/50">=</span>

                                            {needsInput ? (
                                                <DecimalInput
                                                    placeholder="0.00"
                                                    className="h-8 w-28 bg-background border-border/60"
                                                    value={declaredConversions[entry.unitId] ?? ""}
                                                    onValueChange={(value) =>
                                                        setDeclaredConversions((current) => ({
                                                            ...current,
                                                            [entry.unitId]: value,
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <span className="text-sm tabular-nums font-medium">
                                                    {formatQuantity(
                                                        preview!.quantity_breakdown.find(
                                                            (row) => row.original_unit_id === entry.unitId,
                                                        )?.equivalence ?? 0,
                                                    )}
                                                </span>
                                            )}

                                            <span className="text-muted-foreground truncate">
                                                {unitLabel(unitId) || "unidad final"}
                                            </span>

                                            {!needsInput && (
                                                <span className={cn(dependencyBadgeCls(), "ml-auto shrink-0")}>
                                                    Ya registrada
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── Historial de costo ──────────────────────────────────
                        Sección de EDICIÓN, disponible desde que se abre el
                        asistente: el historial combinado se pide aparte, sin
                        depender del preview. Previsualizar sirve para ver el
                        resultado de la fusión, no para poder editar. */}
                    <section className="flex flex-col gap-3">
                        <SectionLabel>Historial de costo</SectionLabel>

                        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5">
                            <div className="min-w-0 flex-1 flex flex-col">
                                <span className="text-sm">
                                    Costo vigente{" "}
                                    <span className="tabular-nums font-medium">
                                        {formatQuantity(survivorCurrentCost)}
                                    </span>
                                    {/* El costo resultante solo lo sabe el
                                        preview: depende de qué artículo
                                        sobrevive y de las ediciones aplicadas. */}
                                    {preview &&
                                        preview.cost_summary.resulting !==
                                            preview.cost_summary.current && (
                                            <>
                                                <ArrowRight className="inline size-3 mx-1.5 text-muted-foreground/40" />
                                                <span className="tabular-nums font-semibold">
                                                    {formatQuantity(preview.cost_summary.resulting)}
                                                </span>
                                            </>
                                        )}
                                </span>
                                <span className="text-[11px] text-muted-foreground/70">
                                    {costHistory.length} registros
                                    {pendingCostEdits > 0
                                        ? ` · ${pendingCostEdits} cambios pendientes`
                                        : ""}
                                </span>
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-9 text-muted-foreground hover:text-foreground"
                                                disabled={isLoadingCost}
                                                onClick={() => setCostDialogOpen(true)}
                                            >
                                                {isLoadingCost ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <ReceiptText className="size-4" />
                                                )}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar historial de costo</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </section>

                    {/* ── Previsualización ────────────────────────────────────
                        Se mantiene visible aunque el usuario esté escribiendo
                        equivalencias; solo se atenúa para dejar claro que el
                        cálculo mostrado aún no las incluye. */}
                    {preview && (
                        <div className={cn(conversionsDirty && "opacity-50 transition-opacity")}>
                            <MergePreviewPanel preview={preview} units={units} />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:items-center">
                    {/* Confirmar exige un preview vigente: cualquier cambio en
                        datos, conversiones o costos lo invalida y obliga a
                        recalcular, para que jamás se fusione con un resultado
                        distinto al que se vio. */}
                    <span className="mr-auto text-[11px] text-muted-foreground text-left">
                        {conversionsDirty
                            ? "Recalcule para aplicar las equivalencias indicadas."
                            : !preview
                              ? "Previsualice el resultado antes de confirmar."
                              : ""}
                    </span>

                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>

                    <SupervisorActionButton
                        emphasis="subtle"
                        onClick={handlePreview}
                        disabled={mergePreview.isPending || !survivorId}
                    >
                        {mergePreview.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {preview ? "Recalcular" : "Previsualizar resultado"}
                    </SupervisorActionButton>

                    <SupervisorActionButton
                        emphasis="primary"
                        onClick={handleMerge}
                        // conversionsDirty bloquea confirmar mientras haya
                        // equivalencias escritas que el preview no refleja: sin
                        // esto se fusionaría con un cálculo distinto al visto.
                        disabled={
                            !preview?.can_merge || conversionsDirty || mergeGeneralArticles.isPending
                        }
                    >
                        {mergeGeneralArticles.isPending && (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Confirmar fusión
                    </SupervisorActionButton>
                </DialogFooter>
            </DialogContent>

            <CostHistoryDialog
                open={costDialogOpen}
                onOpenChange={setCostDialogOpen}
                history={costHistory}
                edits={costEdits}
                onApply={(next) => {
                    setCostEdits(next)
                    // El preview mostrado ya no refleja el historial: se limpia
                    // para forzar recalcular antes de confirmar.
                    setPreview(null)
                    setAppliedConversions({})
                }}
            />
        </Dialog>
    )
}

/**
 * Resultado calculado por el backend. Muestra explícitamente cómo se llegó a
 * la cantidad final — con unidades distintas el número no es la suma simple y
 * el supervisor necesita ver la conversión aplicada para validarla.
 */
function MergePreviewPanel({
    preview,
    units,
}: {
    preview: MergePreview
    units: { id: number; label: string }[]
}) {
    const finalUnitLabel =
        units.find((unit) => unit.id === preview.final.primary_unit_id)?.label ?? ""

    return (
        <section className="relative rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3 select-none">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Resultado de la fusión
                </span>
                <div className="h-px flex-1 bg-border/50" />
            </div>

            {/* Desglose de cantidades */}
            <div className="flex flex-col gap-1.5">
                {preview.quantity_breakdown.map((row) => {
                    const converted = row.converted_quantity !== row.original_quantity

                    return (
                        <div
                            key={row.article_id}
                            className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/70 px-3 py-2"
                        >
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                                <span className="truncate text-sm">
                                    {row.description}
                                    {row.brand_model ? (
                                        <span className="text-muted-foreground/70">
                                            {" · "}
                                            {row.brand_model}
                                        </span>
                                    ) : null}
                                </span>
                                {row.is_survivor && (
                                    <Badge className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-700 shadow-none select-none shrink-0 hover:bg-sky-500/15 dark:text-sky-300">
                                        Sobrevive
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 tabular-nums text-sm">
                                <span className={cn(converted && "text-muted-foreground/60 line-through")}>
                                    {formatQuantity(row.original_quantity)}
                                </span>

                                {converted && (
                                    <>
                                        <ArrowRight className="size-3 text-muted-foreground/40" />
                                        <span className="font-medium">
                                            {formatQuantity(row.converted_quantity)}
                                        </span>
                                        {row.equivalence && (
                                            <span className={dependencyBadgeCls()}>×{row.equivalence}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 select-none">
                    Cantidad final
                </span>
                <span className="text-lg font-semibold tabular-nums">
                    {formatQuantity(preview.final.quantity)}{" "}
                    <span className="text-sm font-normal text-muted-foreground/70">
                        {finalUnitLabel}
                    </span>
                </span>
            </div>

            {/* Filas dependientes a reasignar */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(preview.child_rows)
                    .filter(([, count]) => count > 0)
                    .map(([table, count]) => (
                        <span key={table} className={dependencyBadgeCls()}>
                            {CHILD_TABLE_LABELS[table] ?? table}: {count}
                        </span>
                    ))}
            </div>

            {preview.cost_history.length > 0 && (
                <p className="text-[11px] text-muted-foreground/60 mt-3">
                    El artículo resultante conservará {preview.cost_history.length} registros de
                    historial de costo.
                </p>
            )}
        </section>
    )
}
