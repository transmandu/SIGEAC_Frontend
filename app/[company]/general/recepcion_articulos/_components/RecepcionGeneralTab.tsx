'use client'

import { isNeedsUnitConversionResponse, useConfirmGeneralArticleIntake, useRejectGeneralArticleIntake } from '@/actions/mantenimiento/almacen/inventario/articulos_generales/actions'
import type { NeedsUnitConversionCandidate } from '@/types/purchase'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useGetUnits } from '@/hooks/general/unidades/useGetPrimaryUnits'
import { useGetGeneralArticleIntakes } from '@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticleIntakes'
import { useGetIntakeConfirmationPreview } from '@/hooks/mantenimiento/almacen/almacen_general/useGetIntakeConfirmationPreview'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import type { GeneralArticleIntake, GeneralArticleIntakeStatus } from '@/types/purchase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, ChevronRight, CheckCircle2, Loader2, PackageSearch, Search, XCircle } from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import { DownloadReportDialog } from './DownloadReportDialog'

type StatusFilter = 'ALL' | GeneralArticleIntakeStatus

// ── Detección de discrepancia solicitado vs comprado ────────────────────
// Solo hay algo que mostrar si la línea de compra viene de una requisición
// (general_article_requisition_order) y la cantidad/unidad cotizada difiere
// de la solicitada, o el comprador dejó una justificación explícita.
function getRequisitionDiscrepancy(intake: GeneralArticleIntake) {
    const quoteArticle = intake.general_article_quote_order
    const requisitionArticle = quoteArticle?.general_article_requisition_order
    if (!quoteArticle || !requisitionArticle) return null

    const quantityDiffers = Number(requisitionArticle.quantity) !== Number(quoteArticle.quantity)
    const unitDiffers = (requisitionArticle.unit?.id ?? null) !== (quoteArticle.unit?.id ?? null)

    if (!quantityDiffers && !unitDiffers && !quoteArticle.justification) return null

    return { requisitionArticle, quoteArticle, quantityDiffers, unitDiffers }
}

// ── Panel inline para registrar la conversión de unidad faltante ────────
// Se muestra cuando confirm() respondió needs_conversion=true: el intake
// coincide con un general_article existente en todo menos la unidad, y no
// hay ninguna Conversion registrada entre ambas para ese artículo. En vez de
// crear un artículo duplicado, se captura la equivalencia aquí mismo y se
// reintenta la confirmación con ella.
function UnitConversionPanel({
    intake,
    candidate,
    equivalence,
    onEquivalenceChange,
}: {
    intake: GeneralArticleIntake
    candidate: NeedsUnitConversionCandidate
    equivalence: string
    onEquivalenceChange: (value: string) => void
}) {
    const { selectedCompany } = useCompanyStore()
    const { data: units, isLoading: unitsLoading, isError: unitsError } = useGetUnits(selectedCompany?.slug)

    // El backend serializa estos ids como string en algunos casos (driver
    // sqlsrv); se normaliza a number antes de comparar contra units[].id.
    const intakeUnitLabel = intake.unit?.label ?? units?.find((u) => u.id === Number(candidate.intake_unit_id))?.label
    const existingUnitLabel = units?.find((u) => u.id === Number(candidate.existing_unit_id))?.label

    const parsedEquivalence = parseFloat(equivalence)
    const preview = !Number.isNaN(parsedEquivalence) && parsedEquivalence > 0
        ? (Number(intake.quantity) * parsedEquivalence)
        : null

    // intake.unit ya viene resuelto con el intake, así que intakeUnitLabel casi
    // siempre está listo de inmediato. existingUnitLabel sí depende de
    // useGetUnits (necesitamos el nombre de una unidad que no es la del intake).
    // Solo mientras esa consulta sigue en vuelo mostramos el loader; si termina
    // sin encontrar el id (unitsError, o la lista no lo contiene) avisamos en
    // vez de quedarnos pegados en "cargando" para siempre.
    if (!intakeUnitLabel || (unitsLoading && !existingUnitLabel)) {
        return (
            <div className="rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-700/60 dark:bg-amber-950/20">
                <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin" />
                    Cargando unidades...
                </p>
            </div>
        )
    }

    if (!existingUnitLabel) {
        return (
            <div className="rounded-md border border-dashed border-red-300 bg-red-50/60 p-3 dark:border-red-700/60 dark:bg-red-950/20">
                <p className="text-xs text-red-700 dark:text-red-400">
                    {unitsError
                        ? 'No se pudo cargar el catálogo de unidades. Intenta de nuevo.'
                        : 'No se encontró la unidad existente del artículo. Verifica el catálogo de unidades.'}
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-3 space-y-3 dark:border-amber-700/60 dark:bg-amber-950/20">
            <p className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">{candidate.description}</span> ya existe en el inventario, pero se
                guarda en <span className="font-semibold uppercase">{existingUnitLabel}</span> y esta entrada llegó
                cotizada en <span className="font-semibold uppercase">{intakeUnitLabel}</span>. Indica cuántos{' '}
                {existingUnitLabel.toUpperCase()} tiene 1 {intakeUnitLabel.toUpperCase()} (revisa la ficha técnica o
                empaque del producto) para guardarla junto con lo que ya hay, en vez de crear un artículo repetido.
            </p>

            {/* Fórmula explícita: "1 [unidad que llegó] = [input] [unidad que ya existe]" —
                se pide en el sentido de la unidad conocida (la que compraste) hacia la
                desconocida, que es como cualquier persona piensa una equivalencia real
                (ej. "1 cuarto de galón tiene 0.946 litros"), no al revés. */}
            <div className="flex items-center justify-center gap-2 rounded-md bg-background/70 border border-border/60 px-3 py-2.5">
                <span className="text-sm font-semibold whitespace-nowrap">
                    1 <span className="rounded bg-muted px-1.5 py-0.5 uppercase text-xs">{intakeUnitLabel}</span>
                </span>
                <span className="text-sm font-semibold text-muted-foreground">=</span>
                <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="?"
                    value={equivalence}
                    onChange={(e) => onEquivalenceChange(e.target.value.replace(/[^\d.]/g, ''))}
                    className="h-9 w-16 text-center text-sm font-semibold"
                    autoFocus
                />
                <span className="text-sm font-semibold whitespace-nowrap">
                    <span className="rounded bg-muted px-1.5 py-0.5 uppercase text-xs">{existingUnitLabel}</span>
                </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                {preview !== null ? (
                    <>
                        Esta entrada de <span className="font-semibold text-foreground">{intake.quantity} {intakeUnitLabel.toUpperCase()}</span>{' '}
                        se guardará como{' '}
                        <span className="font-semibold text-foreground">{preview.toFixed(2)} {existingUnitLabel.toUpperCase()}</span>.
                    </>
                ) : (
                    <>Escribe el número para ver cuánto quedará registrado en inventario.</>
                )}
            </p>
        </div>
    )
}

// ── Acción de confirmar una entrada ─────────────────────────────────────
function ConfirmIntakeAction({ intake }: { intake: GeneralArticleIntake }) {
    const [open, setOpen] = useState(false)
    const [confirmedAt, setConfirmedAt] = useState<Date>(() => new Date())
    const [equivalence, setEquivalence] = useState('')
    const { confirmGeneralArticleIntake } = useConfirmGeneralArticleIntake()
    const { user } = useAuth()

    // Se consulta apenas se abre el diálogo (no al primer click en
    // "Confirmar"), para que el panel de conversión aparezca de una vez si
    // aplica. Antes esto se detectaba dejando fallar un primer intento de
    // confirmar con 422, lo que obligaba a dos peticiones completas (cada
    // una repitiendo las mismas consultas dentro de una transacción) para
    // el mismo resultado.
    const { data: preview, isLoading: previewLoading } = useGetIntakeConfirmationPreview(intake.id, open)
    const previewCandidate = preview?.needs_conversion ? preview.candidate ?? null : null

    // Si confirm() igual responde needs_conversion (ej. el preview quedó
    // desactualizado por un cambio concurrente), este fallback sigue
    // funcionando como red de seguridad.
    const [fallbackCandidate, setFallbackCandidate] = useState<NeedsUnitConversionCandidate | null>(null)
    const conversionCandidate = previewCandidate ?? fallbackCandidate

    const canEditDate = useMemo(
        () => (user?.roles ?? []).some((r) => r.name === 'JEFE_ALMACEN' || r.name === 'ANALISTA_ALMACEN' || r.name === 'SUPERUSER'),
        [user?.roles]
    )

    const arrivedAt = useMemo(
        () => (intake.arrived_at ? new Date(intake.arrived_at) : null),
        [intake.arrived_at]
    )

    const isBeforeArrival = !!arrivedAt && confirmedAt < arrivedAt

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setConfirmedAt(new Date())
            setFallbackCandidate(null)
            setEquivalence('')
        }
        setOpen(next)
    }

    const handleConfirm = () => {
        confirmGeneralArticleIntake.mutate(
            {
                id: intake.id,
                confirmedAt: canEditDate ? confirmedAt : undefined,
                newConversionEquivalence: conversionCandidate ? parseFloat(equivalence) : undefined,
            },
            {
                onSuccess: () => setOpen(false),
                onError: (error: any) => {
                    const responseData = error?.response?.data
                    if (isNeedsUnitConversionResponse(responseData)) {
                        setFallbackCandidate(responseData.candidate)
                    }
                },
            }
        )
    }

    const parsedEquivalence = parseFloat(equivalence)
    const needsValidEquivalence = !!conversionCandidate && (Number.isNaN(parsedEquivalence) || parsedEquivalence <= 0)

    const handleDateSelect = (day: Date | undefined) => {
        if (!day) return
        setConfirmedAt((prev) => {
            const next = new Date(day)
            next.setHours(prev.getHours(), prev.getMinutes(), 0, 0)
            return next
        })
    }

    const handleTimeChange = (value: string) => {
        const [hours, minutes] = value.split(':').map(Number)
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return
        setConfirmedAt((prev) => {
            const next = new Date(prev)
            next.setHours(hours, minutes, 0, 0)
            return next
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <button
                    disabled={confirmGeneralArticleIntake.isPending}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-300 bg-emerald-100 px-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-200 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                >
                    {confirmGeneralArticleIntake.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <CheckCircle2 className="size-3" />
                    )}
                    Confirmar
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar recepción</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás a punto de confirmar la recepción física de{' '}
                        <span className="font-semibold text-foreground">{intake.quantity}</span>{' '}
                        {intake.unit?.label ?? 'unidad(es)'} de{' '}
                        <span className="font-semibold text-foreground">{intake.description}</span>.
                        Esta acción incrementará el stock real del artículo general y no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {canEditDate && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Fecha y hora de confirmación
                            </span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'h-9 flex-1 justify-start text-sm bg-background/70',
                                            !confirmedAt && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                                        {format(confirmedAt, 'dd MMM yyyy', { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={confirmedAt}
                                        onSelect={handleDateSelect}
                                        locale={es}
                                        initialFocus
                                        disabled={arrivedAt ? { before: arrivedAt } : undefined}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Input
                                type="time"
                                value={format(confirmedAt, 'HH:mm')}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="h-9 w-28 bg-background/70 text-sm"
                            />
                        </div>

                        {isBeforeArrival && arrivedAt && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                La fecha y hora de confirmación no puede ser anterior a la llegada
                                ({format(arrivedAt, "dd/MM/yyyy HH:mm", { locale: es })}).
                            </p>
                        )}
                    </div>
                )}

                {previewLoading && !conversionCandidate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="size-3 animate-spin" />
                        Verificando artículo...
                    </p>
                )}

                {conversionCandidate && (
                    <UnitConversionPanel
                        intake={intake}
                        candidate={conversionCandidate}
                        equivalence={equivalence}
                        onEquivalenceChange={setEquivalence}
                    />
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirmGeneralArticleIntake.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={confirmGeneralArticleIntake.isPending || previewLoading || (canEditDate && isBeforeArrival) || needsValidEquivalence}
                        onClick={(e) => {
                            // Radix cierra el diálogo al hacer click en Action; lo evitamos
                            // porque handleConfirm puede necesitar mantenerlo abierto para
                            // mostrar el panel de conversión si el backend lo pide.
                            e.preventDefault()
                            handleConfirm()
                        }}
                    >
                        {conversionCandidate ? 'Convertir y confirmar' : 'Confirmar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ── Acción de rechazar una entrada ──────────────────────────────────────
// Para cuando la verificación física no coincide con lo registrado (artículo
// o cantidad distintos). Exige justificación; el backend notifica al usuario
// que registró la entrega para que revise y re-registre sobre la misma orden.
function RejectIntakeAction({ intake }: { intake: GeneralArticleIntake }) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const { rejectGeneralArticleIntake } = useRejectGeneralArticleIntake()

    const handleOpenChange = (next: boolean) => {
        if (next) setReason('')
        setOpen(next)
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={rejectGeneralArticleIntake.isPending}
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/60"
                            >
                                {rejectGeneralArticleIntake.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <XCircle className="size-3.5" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">Rechazar</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rechazar recepción</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás a punto de rechazar la entrada de{' '}
                        <span className="font-semibold text-foreground">{intake.quantity}</span>{' '}
                        {intake.unit?.label ?? 'unidad(es)'} de{' '}
                        <span className="font-semibold text-foreground">{intake.description}</span>{' '}
                        por no coincidir con lo verificado físicamente. No se modificará el stock,
                        y el responsable de la entrega será notificado para que revise la
                        discrepancia y vuelva a registrar la entrega cuando la resuelva.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Justificación del rechazo
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                    </div>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej.: El artículo recibido no corresponde al registrado / llegaron 24 unidades y la entrada indica 6..."
                        className="min-h-24 bg-background/70 text-sm"
                        maxLength={2000}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={rejectGeneralArticleIntake.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={rejectGeneralArticleIntake.isPending || !reason.trim()}
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() =>
                            rejectGeneralArticleIntake.mutate({
                                id: intake.id,
                                rejectionReason: reason.trim(),
                            })
                        }
                    >
                        Rechazar entrada
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ── Sub-row: comparación solicitado vs comprado + justificación de rechazo ─
// Se muestra cuando hay discrepancia de requisición y/o la entrada fue
// rechazada; cada bloque aparece solo si le corresponde a esta entrada.
function IntakeDetailRow({
    intake,
    discrepancy,
}: {
    intake: GeneralArticleIntake
    discrepancy: ReturnType<typeof getRequisitionDiscrepancy>
}) {
    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={8} className="p-0 border-b border-border/40">
                <div className={cn(
                    'flex flex-col gap-3 pl-10 pr-4 py-3 text-xs',
                    discrepancy ? 'bg-muted/20 border-l-2 border-amber-300 dark:border-amber-700/60' : 'bg-red-50/40 dark:bg-red-950/10 border-l-2 border-red-300 dark:border-red-700/60'
                )}>
                    {discrepancy && (
                        <div className="flex flex-col gap-1.5">
                            <span className="font-medium uppercase tracking-wide text-[10px] text-muted-foreground">
                                Diferencia con lo solicitado
                            </span>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className={cn(discrepancy.quantityDiffers || discrepancy.unitDiffers ? 'text-foreground' : 'text-muted-foreground')}>
                                    Solicitado:{' '}
                                    <span className="font-semibold tabular-nums">{discrepancy.requisitionArticle.quantity}</span>{' '}
                                    {discrepancy.requisitionArticle.unit?.label ?? ''}
                                </span>
                                <span className="text-muted-foreground">→</span>
                                <span className={cn(discrepancy.quantityDiffers || discrepancy.unitDiffers ? 'text-foreground' : 'text-muted-foreground')}>
                                    Comprado:{' '}
                                    <span className="font-semibold tabular-nums">{discrepancy.quoteArticle.quantity}</span>{' '}
                                    {discrepancy.quoteArticle.unit?.label ?? ''}
                                </span>
                            </div>
                            {discrepancy.quoteArticle.justification && (
                                <span className="italic text-muted-foreground">
                                    Justificación de la compra: “{discrepancy.quoteArticle.justification}”
                                </span>
                            )}
                        </div>
                    )}

                    {intake.status === 'REJECTED' && intake.rejection_reason && (
                        <div className="flex flex-col gap-1.5">
                            <span className="font-medium uppercase tracking-wide text-[10px] text-red-600/80 dark:text-red-400/80">
                                Justificación del rechazo
                            </span>
                            <span className="text-muted-foreground">
                                <span className="uppercase">{intake.rejected_by}</span>
                                {intake.rejected_at && (
                                    <> — {format(new Date(intake.rejected_at), "dd/MM/yyyy HH:mm", { locale: es })}</>
                                )}
                            </span>
                            <span className="italic text-red-600/80 dark:text-red-400/80">
                                “{intake.rejection_reason}”
                            </span>
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

// ── Fila de entrada ──────────────────────────────────────────────────────
const IntakeRow = memo(function IntakeRow({ intake }: { intake: GeneralArticleIntake }) {
    const { selectedCompany } = useCompanyStore()
    const isPending = intake.status === 'PENDING'
    const isRejected = intake.status === 'REJECTED'
    const [expanded, setExpanded] = useState(false)
    const discrepancy = useMemo(() => getRequisitionDiscrepancy(intake), [intake])
    const hasRejectionDetail = isRejected && !!intake.rejection_reason
    const canExpand = !!discrepancy || hasRejectionDetail
    const requisitionOrderNumber = intake.purchase_order?.quote_order?.requisition_order?.order_number

    return (
        <>
        <TableRow
            className={cn('hover:bg-muted/30 transition-colors', canExpand && 'cursor-pointer')}
            onClick={canExpand ? () => setExpanded((v) => !v) : undefined}
        >
            {/* Expand toggle */}
            <TableCell className="w-6 p-0 text-center">
                {canExpand && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setExpanded((v) => !v)
                        }}
                        className="flex items-center justify-center rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors mx-auto"
                    >
                        <ChevronRight
                            className={cn(
                                'size-3.5 transition-transform duration-150',
                                expanded && 'rotate-90',
                                expanded && (discrepancy ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500')
                            )}
                        />
                    </button>
                )}
            </TableCell>

            <TableCell>
                <div className="space-y-1 min-w-0">
                    <span className="text-sm font-medium">{intake.description}</span>
                    {(intake.brand_model || intake.variant_type) && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            {intake.brand_model && <span>{intake.brand_model}</span>}
                            {intake.brand_model && intake.variant_type && <span>·</span>}
                            {intake.variant_type && <span>{intake.variant_type}</span>}
                        </div>
                    )}
                </div>
            </TableCell>

            <TableCell>
                <span className="text-sm font-semibold tabular-nums">
                    {intake.quantity}
                    {intake.unit?.label && (
                        <span className="ml-1 font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                            {intake.unit.label}
                        </span>
                    )}
                </span>
            </TableCell>

            <TableCell onClick={(e) => e.stopPropagation()}>
                {requisitionOrderNumber ? (
                    <Link
                        href={`/${selectedCompany?.slug}/general/requisiciones/${requisitionOrderNumber}`}
                        className="text-xs text-muted-foreground hover:underline"
                    >
                        {requisitionOrderNumber}
                    </Link>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </TableCell>

            <TableCell>
                <span className="text-xs text-muted-foreground">
                    {intake.arrived_at ? format(new Date(intake.arrived_at), 'dd/MM/yyyy HH:mm') : '—'}
                </span>
            </TableCell>

            <TableCell>
                <span className="text-xs text-muted-foreground uppercase">{intake.registered_by}</span>
            </TableCell>

            <TableCell>
                <Badge
                    className={cn(
                        'text-[10px] font-medium uppercase tracking-wide',
                        isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                            : isRejected
                                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                    )}
                    variant="outline"
                >
                    {intake.status}
                </Badge>
            </TableCell>

            <TableCell onClick={(e) => e.stopPropagation()}>
                {isPending ? (
                    <div className="flex items-center gap-1.5">
                        <ConfirmIntakeAction intake={intake} />
                        <RejectIntakeAction intake={intake} />
                    </div>
                ) : isRejected ? (
                    <span className="text-[11px] text-muted-foreground">
                        Rechazado por:
                        <br />
                        <span className="uppercase">{intake.rejected_by}</span>
                        {intake.rejected_at && (
                            <>
                                <br />
                                El {format(new Date(intake.rejected_at), "dd/MM/yyyy HH:mm", { locale: es })}
                            </>
                        )}
                    </span>
                ) : (
                    <span className="text-[11px] text-muted-foreground">
                        Confirmado por:
                        <br />
                        <span className="uppercase">{intake.confirmed_by}</span>
                        {intake.confirmed_at && (
                            <>
                                <br />
                                El {format(new Date(intake.confirmed_at), "dd/MM/yyyy HH:mm", { locale: es })}
                            </>
                        )}
                    </span>
                )}
            </TableCell>
        </TableRow>
        {expanded && canExpand && <IntakeDetailRow intake={intake} discrepancy={discrepancy} />}
        </>
    )
})

// ── Tab ──────────────────────────────────────────────────────────────────
export function RecepcionGeneralTab() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')

    // Solo entradas destinadas a un almacén: las entregas directas a
    // departamento/empleado/autorizado/tercero nunca entran al inventario y
    // se gestionan únicamente desde Compras → Recepción General.
    const { data: intakes, isLoading } = useGetGeneralArticleIntakes(undefined, { warehouseOnly: true })

    const filtered = useMemo(() => {
        const all = intakes ?? []
        const byStatus = statusFilter === 'ALL' ? all : all.filter((i) => i.status === statusFilter)

        if (!search.trim()) return byStatus

        const q = search.trim().toLowerCase()
        return byStatus.filter(
            (i) =>
                i.description?.toLowerCase().includes(q) ||
                i.brand_model?.toLowerCase().includes(q) ||
                i.purchase_order?.quote_order?.requisition_order?.order_number?.toLowerCase().includes(q) ||
                i.registered_by?.toLowerCase().includes(q)
        )
    }, [intakes, statusFilter, search])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        )
    }

    const totalPending = intakes?.filter((i) => i.status === 'PENDING').length ?? 0
    const totalConfirmed = intakes?.filter((i) => i.status === 'CONFIRMED').length ?? 0
    const totalRejected = intakes?.filter((i) => i.status === 'REJECTED').length ?? 0

    return (
        <div className="flex flex-col gap-y-3">
            {/* Encabezado */}
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Recepción General</h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {filtered.length} {filtered.length === 1 ? 'entrada' : 'entradas'}
                    </span>
                    <DownloadReportDialog
                        endpoint="{location_id}/general-article-intakes-pdf?destination=warehouse"
                        requiresLocation
                        title="Descargar Reporte de Recepción General"
                        description="Selecciona el rango de fechas y el estado para filtrar las entradas."
                        dateRangeLabel="Rango de Fechas"
                        fileNamePrefix="recepcion_general"
                        dateFieldOptions={[
                            { value: 'arrived_at', label: 'Fecha de Llegada' },
                            { value: 'confirmed_at', label: 'Fecha de Confirmación' },
                        ]}
                        statusOptions={[
                            { value: 'ALL', label: 'Todas' },
                            { value: 'PENDING', label: 'Pendientes' },
                            { value: 'CONFIRMED', label: 'Confirmadas' },
                            { value: 'REJECTED', label: 'Rechazadas' },
                        ]}
                    />
                </div>
            </div>

            {/* Filtros + búsqueda */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-md border border-border overflow-hidden">
                    {([
                        { value: 'ALL', label: 'Todas', count: totalPending + totalConfirmed + totalRejected },
                        { value: 'PENDING', label: 'Pendientes', count: totalPending },
                        { value: 'CONFIRMED', label: 'Confirmadas', count: totalConfirmed },
                        { value: 'REJECTED', label: 'Rechazadas', count: totalRejected },
                    ] as { value: StatusFilter; label: string; count: number }[]).map(({ value, label, count }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0',
                                statusFilter === value
                                    ? value === 'PENDING'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                        : value === 'CONFIRMED'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                            : value === 'REJECTED'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                                                : 'bg-muted text-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted/50'
                            )}
                        >
                            {label}
                            <span className={cn(
                                'ml-1.5 px-1 py-0 rounded text-[10px] font-semibold',
                                statusFilter === value ? 'bg-background/60' : 'bg-muted'
                            )}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative ml-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar descripción, orden, responsable..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs w-72"
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-6 p-0" />
                            <TableHead className="text-xs">Artículo</TableHead>
                            <TableHead className="text-xs">Cantidad</TableHead>
                            <TableHead className="text-xs">Solicitud de Compra</TableHead>
                            <TableHead className="text-xs">Llegada</TableHead>
                            <TableHead className="text-xs">Entregado por</TableHead>
                            <TableHead className="text-xs">Estado</TableHead>
                            <TableHead className="text-xs">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((intake) => <IntakeRow key={intake.id} intake={intake} />)
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <PackageSearch className="size-5 text-muted-foreground/50" />
                                        No se encontraron entradas
                                        {statusFilter !== 'ALL' && ` con estado ${statusFilter}`}
                                        {search && ` que coincidan con "${search}"`}.
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
