'use client'

import { useConfirmGeneralArticleIntake } from '@/actions/mantenimiento/almacen/inventario/articulos_generales/actions'
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
import { useAuth } from '@/contexts/AuthContext'
import { useGetGeneralArticleIntakes } from '@/hooks/mantenimiento/almacen/almacen_general/useGetGeneralArticleIntakes'
import { cn } from '@/lib/utils'
import type { GeneralArticleIntake, GeneralArticleIntakeStatus } from '@/types/purchase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, CheckCircle2, Loader2, PackageSearch, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

type StatusFilter = 'ALL' | GeneralArticleIntakeStatus

// ── Acción de confirmar una entrada ─────────────────────────────────────
function ConfirmIntakeAction({ intake }: { intake: GeneralArticleIntake }) {
    const [open, setOpen] = useState(false)
    const [confirmedAt, setConfirmedAt] = useState<Date>(() => new Date())
    const { confirmGeneralArticleIntake } = useConfirmGeneralArticleIntake()
    const { user } = useAuth()

    const canEditDate = useMemo(
        () => (user?.roles ?? []).some((r) => r.name === 'JEFE_ALMACEN' || r.name === 'ANALISTA_ALMACEN' || r.name === 'SUPERUSER'),
        [user?.roles]
    )

    const handleOpenChange = (next: boolean) => {
        if (next) setConfirmedAt(new Date())
        setOpen(next)
    }

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
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400"
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
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirmGeneralArticleIntake.isPending}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={confirmGeneralArticleIntake.isPending}
                        onClick={() =>
                            confirmGeneralArticleIntake.mutate({
                                id: intake.id,
                                confirmedAt: canEditDate ? confirmedAt : undefined,
                            })
                        }
                    >
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ── Fila de entrada ──────────────────────────────────────────────────────
function IntakeRow({ intake }: { intake: GeneralArticleIntake }) {
    const isPending = intake.status === 'PENDING'

    return (
        <TableRow className="hover:bg-muted/30 transition-colors">
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

            <TableCell>
                <span className="text-xs text-muted-foreground">
                    {intake.purchase_order?.quote_order?.requisition_order?.order_number ?? '—'}
                </span>
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
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                    )}
                    variant="outline"
                >
                    {intake.status}
                </Badge>
            </TableCell>

            <TableCell>
                {isPending ? (
                    <ConfirmIntakeAction intake={intake} />
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
    )
}

// ── Tab ──────────────────────────────────────────────────────────────────
export function RecepcionGeneralTab() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')

    const { data: intakes, isLoading } = useGetGeneralArticleIntakes()

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

    return (
        <div className="flex flex-col gap-y-3">
            {/* Encabezado */}
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Recepción General</h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {filtered.length} {filtered.length === 1 ? 'entrada' : 'entradas'}
                </span>
            </div>

            {/* Filtros + búsqueda */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-md border border-border overflow-hidden">
                    {([
                        { value: 'ALL', label: 'Todas', count: totalPending + totalConfirmed },
                        { value: 'PENDING', label: 'Pendientes', count: totalPending },
                        { value: 'CONFIRMED', label: 'Confirmadas', count: totalConfirmed },
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
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
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
