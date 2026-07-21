"use client"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGetUnits } from "@/hooks/general/unidades/useGetPrimaryUnits"
import {
    useGetArticleDetail,
    useUpdateSupervisorArticle,
} from "@/hooks/supervisor/useSupervisorGeneralArticles"
import { useCompanyStore } from "@/stores/CompanyStore"
import type {
    ArticleFieldEdits,
    ConversionEdits,
    CostChangeEdits,
    SupervisorGeneralArticle,
} from "@/types/supervisor"
import { AlertTriangle, Loader2, PencilLine } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ConversionsPanel } from "./ConversionsPanel"
import { CostHistoryPanel } from "./CostHistoryPanel"
import { DecimalInput } from "./DecimalInput"
import SupervisorActionButton from "./SupervisorActionButton"

/**
 * Edición individual de un artículo general.
 *
 * Separa deliberadamente los campos de texto (corrección de tipeo, sin
 * consecuencias) de cantidad y unidad, que alteran el stock real. El bloque
 * inferior queda cerrado hasta que el supervisor lo abre explícitamente:
 * corregir "TORNILO" no debe poder descuadrar el inventario por un descuido.
 */
export function EditArticleDialog({
    open,
    onOpenChange,
    article,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    article: SupervisorGeneralArticle | null
}) {
    const [description, setDescription] = useState("")
    const [brandModel, setBrandModel] = useState("")
    const [variantType, setVariantType] = useState("")
    const [minimumQuantity, setMinimumQuantity] = useState("")
    const [quantity, setQuantity] = useState("")
    const [unitId, setUnitId] = useState<number | null>(null)
    const [stockUnlocked, setStockUnlocked] = useState(false)
    // Ediciones pendientes de las otras dos pestañas. Nada se escribe hasta
    // confirmar: las tres áreas se persisten juntas en una transacción.
    const [conversionEdits, setConversionEdits] = useState<ConversionEdits>({})
    const [costEdits, setCostEdits] = useState<CostChangeEdits>({})

    const { selectedCompany } = useCompanyStore()
    const { updateArticle } = useUpdateSupervisorArticle()
    const { data: units } = useGetUnits(selectedCompany?.slug)
    // Conversiones e historial solo se piden con el diálogo abierto.
    const { data: detail, isLoading } = useGetArticleDetail(open ? (article?.id ?? null) : null)

    useEffect(() => {
        if (!open || !article) return

        setDescription(article.description ?? "")
        setBrandModel(article.brand_model ?? "")
        setVariantType(article.variant_type ?? "")
        setMinimumQuantity(article.minimum_quantity != null ? String(article.minimum_quantity) : "")
        setQuantity(String(article.quantity ?? ""))
        setUnitId(article.primary_unit_id)
        setStockUnlocked(false)
        setConversionEdits({})
        setCostEdits({})
    }, [open, article])

    /**
     * Solo los campos que cambiaron. Enviar la fila completa haría que el
     * audit log registre como modificado lo que el supervisor ni tocó.
     */
    const articleEdits = useMemo((): ArticleFieldEdits => {
        if (!article) return {}

        const edits: ArticleFieldEdits = {}

        if (description.trim() !== (article.description ?? "")) {
            edits.description = description.trim()
        }

        if ((brandModel.trim() || null) !== (article.brand_model ?? null)) {
            edits.brand_model = brandModel.trim() || null
        }

        if ((variantType.trim() || null) !== (article.variant_type ?? null)) {
            edits.variant_type = variantType.trim() || null
        }

        const currentMinimum =
            article.minimum_quantity != null ? String(article.minimum_quantity) : ""

        if (minimumQuantity !== currentMinimum) {
            edits.minimum_quantity = minimumQuantity === "" ? null : Number(minimumQuantity)
        }

        // Cantidad y unidad solo viajan si el supervisor abrió el bloque: así
        // una edición de texto nunca los toca.
        if (stockUnlocked) {
            if (Number(quantity) !== Number(article.quantity)) {
                edits.quantity = Number(quantity)
            }

            if (unitId !== null && unitId !== article.primary_unit_id) {
                edits.primary_unit_id = unitId
            }
        }

        return edits
    }, [
        article,
        description,
        brandModel,
        variantType,
        minimumQuantity,
        quantity,
        unitId,
        stockUnlocked,
    ])

    const pendingCount = useMemo(
        () =>
            Object.keys(articleEdits).length +
            (conversionEdits.created?.length ?? 0) +
            (conversionEdits.updated?.length ?? 0) +
            (conversionEdits.deleted?.length ?? 0) +
            (costEdits.created?.length ?? 0) +
            (costEdits.updated?.length ?? 0) +
            (costEdits.deleted?.length ?? 0),
        [articleEdits, conversionEdits, costEdits],
    )

    if (!article) return null

    const stockChanged =
        stockUnlocked &&
        (Number(quantity) !== Number(article.quantity) || unitId !== article.primary_unit_id)

    const handleSave = async () => {
        await updateArticle.mutateAsync({
            id: article.id,
            data: {
                ...(Object.keys(articleEdits).length > 0 ? { article: articleEdits } : {}),
                ...(hasEdits(conversionEdits) ? { conversions: conversionEdits } : {}),
                ...(hasEdits(costEdits) ? { cost_changes: costEdits } : {}),
            },
        })

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2.5">
                        <PencilLine className="size-5 text-muted-foreground/70" />
                        Editar artículo
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Los cambios quedan registrados en el recorrido del artículo con su autor y
                        fecha.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="datos" className="py-1">
                    <TabsList className="w-fit">
                        <TabsTrigger value="datos" className="text-xs">
                            Datos
                            {Object.keys(articleEdits).length > 0 && <PendingDot />}
                        </TabsTrigger>
                        <TabsTrigger value="conversiones" className="text-xs">
                            Conversiones
                            {!!detail?.conversions.length && (
                                <span className="ml-1.5 tabular-nums text-muted-foreground">
                                    {detail.conversions.length}
                                </span>
                            )}
                            {hasEdits(conversionEdits) && <PendingDot />}
                        </TabsTrigger>
                        <TabsTrigger value="costos" className="text-xs">
                            Historial de costo
                            {!!detail?.cost_history.length && (
                                <span className="ml-1.5 tabular-nums text-muted-foreground">
                                    {detail.cost_history.length}
                                </span>
                            )}
                            {hasEdits(costEdits) && <PendingDot />}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Datos ───────────────────────────────────────────── */}
                    <TabsContent value="datos" className="mt-4 flex flex-col gap-5">
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 select-none">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                Identificación
                            </span>
                            <div className="h-px flex-1 bg-border/50" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <FieldLabel htmlFor="edit-description">Descripción</FieldLabel>
                                <Input
                                    id="edit-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="edit-brand">Marca / Modelo</FieldLabel>
                                <Input
                                    id="edit-brand"
                                    value={brandModel}
                                    onChange={(event) => setBrandModel(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="edit-variant">Present. / Especif.</FieldLabel>
                                <Input
                                    id="edit-variant"
                                    value={variantType}
                                    onChange={(event) => setVariantType(event.target.value)}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <FieldLabel htmlFor="edit-minimum">Cantidad mínima</FieldLabel>
                                <DecimalInput
                                    id="edit-minimum"
                                    placeholder="0.00"
                                    value={minimumQuantity}
                                    onValueChange={setMinimumQuantity}
                                    className="h-9 bg-background/70 border-border/60"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ── Stock y unidad ──────────────────────────────────── */}
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 select-none">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                Existencia y unidad
                            </span>
                            <div className="h-px flex-1 bg-border/50" />
                            {!stockUnlocked && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground shrink-0"
                                    onClick={() => setStockUnlocked(true)}
                                >
                                    Habilitar edición
                                </Button>
                            )}
                        </div>

                        {stockUnlocked ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <FieldLabel htmlFor="edit-quantity">Cantidad</FieldLabel>
                                        <DecimalInput
                                            id="edit-quantity"
                                            value={quantity}
                                            onValueChange={setQuantity}
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
                                                {(units ?? []).map((unit) => (
                                                    <SelectItem key={unit.id} value={String(unit.id)}>
                                                        {unit.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {stockChanged && (
                                    <div className="flex items-start gap-2.5 rounded-lg border border-sky-400/40 bg-sky-500/[0.07] dark:border-sky-300/25 px-3 py-2.5">
                                        <AlertTriangle className="size-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Está modificando el stock real. Cambiar la unidad{" "}
                                            <strong className="text-foreground/80">no</strong>{" "}
                                            reconvierte la cantidad: si el artículo estaba mal
                                            registrado en otra unidad, ajuste también la cantidad
                                            para que refleje la existencia física.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                                <span className="text-sm tabular-nums">
                                    {Number(article.quantity).toFixed(2)}{" "}
                                    <span className="text-muted-foreground/70">
                                        {article.general_primary_unit?.label ?? ""}
                                    </span>
                                </span>
                                <span className="text-[11px] text-muted-foreground/60">
                                    Bloqueado para evitar cambios accidentales de inventario
                                </span>
                            </div>
                        )}
                    </section>
                    </TabsContent>

                    {/* ── Conversiones ────────────────────────────────────── */}
                    <TabsContent value="conversiones" className="mt-4">
                        {isLoading ? (
                            <PanelLoader />
                        ) : (
                            <ConversionsPanel
                                conversions={detail?.conversions ?? []}
                                units={units ?? []}
                                edits={conversionEdits}
                                onChange={setConversionEdits}
                            />
                        )}
                    </TabsContent>

                    {/* ── Historial de costo ──────────────────────────────── */}
                    <TabsContent value="costos" className="mt-4">
                        {isLoading ? (
                            <PanelLoader />
                        ) : (
                            <CostHistoryPanel
                                history={detail?.cost_history ?? []}
                                currentCost={detail?.current_cost ?? 0}
                                edits={costEdits}
                                onChange={setCostEdits}
                            />
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 border-t border-border/60 pt-4 sm:items-center">
                    <span className="mr-auto text-[11px] text-muted-foreground text-left">
                        {pendingCount > 0
                            ? `${pendingCount} cambio(s) sin guardar en este artículo`
                            : "Nada se guarda hasta confirmar"}
                    </span>

                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <SupervisorActionButton
                        emphasis="primary"
                        onClick={handleSave}
                        // Se activa con cambios en CUALQUIERA de las tres
                        // pestañas; al confirmar se envía solo lo modificado.
                        disabled={
                            pendingCount === 0 || !description.trim() || updateArticle.isPending
                        }
                    >
                        {updateArticle.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Confirmar cambios
                    </SupervisorActionButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/** ¿Hay algo pendiente en un bloque de ediciones? */
function hasEdits(edits: ConversionEdits | CostChangeEdits): boolean {
    return (
        (edits.created?.length ?? 0) > 0 ||
        (edits.updated?.length ?? 0) > 0 ||
        (edits.deleted?.length ?? 0) > 0
    )
}

/** Punto que marca una pestaña con cambios sin guardar. */
function PendingDot() {
    return <span className="ml-1.5 size-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
}

function PanelLoader() {
    return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
        </div>
    )
}

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
