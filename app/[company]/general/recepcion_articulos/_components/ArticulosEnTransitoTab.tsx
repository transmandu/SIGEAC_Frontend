'use client'

import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useGetArticlesByStatus } from '@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import { ArrowRight, ChevronRight, Loader2, MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import type { TransitArticle } from '@/types/purchase/in-transit'
import { ArticleDetailDialog } from './ArticleDetailDialog'
import { DownloadReportDialog } from './DownloadReportDialog'

type StatusFilter = 'ALL' | 'TRANSIT' | 'RECEPTION'

const TRANSIT_STATUS_LABELS: Record<string, string> = {
    TRANSIT: 'En tránsito',
    RECEPTION: 'En recepción',
}

// ── Fila de artículo ───────────────────────────────────────────────────
const ArticleRow = memo(function ArticleRow({ article }: { article: TransitArticle }) {
    const { selectedCompany } = useCompanyStore()
    const { updateArticleStatus } = useUpdateArticleStatus()
    const [pending, setPending] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const status = article.status?.toUpperCase()
    const isReception = status === 'RECEPTION'

    const handleMoveToIncoming = async () => {
        setPending(true)
        await updateArticleStatus.mutateAsync({ id: article.id, status: 'INCOMING' })
        setPending(false)
    }

    const location = article.batch?.warehouse?.location

    const hasExtra = article.condition || article.manufacturer || article.quantity != null || article.unit

    return (
        <>
            <TableRow
                className={cn('hover:bg-muted/30 transition-colors', hasExtra && 'cursor-pointer')}
                onClick={hasExtra ? () => setExpanded((v) => !v) : undefined}
            >
                {/* Expand toggle */}
                <TableCell className="w-6 p-0 text-center">
                    {hasExtra && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setExpanded((v) => !v)
                            }}
                            className="flex items-center justify-center rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors mx-auto"
                        >
                            <ChevronRight className={cn(
                                'size-3.5 transition-transform duration-150',
                                expanded && 'rotate-90 text-amber-600 dark:text-amber-500'
                            )} />
                        </button>
                    )}
                </TableCell>

                {/* Parte / Alterno */}
                <TableCell className="text-center">
                    <div className="space-y-1 flex flex-col items-center">
                        <div className="font-mono text-[12px] font-semibold bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 w-fit tracking-wide">
                            {article.part_number}
                        </div>
                        {article.alternative_part_number ? (
                            <div className="flex items-center gap-1">
                                <span className="shrink-0 text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-1 py-0.5 rounded tracking-widest select-none">
                                    ALT
                                </span>
                                <span className="font-mono text-[11px] text-muted-foreground truncate">
                                    {article.alternative_part_number}
                                </span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-mono text-muted-foreground/30 border border-dashed border-border/30 px-1 py-0.5 rounded">
                                ALT N/A
                            </span>
                        )}
                    </div>
                </TableCell>

                {/* Descripción (batch) */}
                <TableCell className="text-center">
                    <span className="text-sm font-medium">{article.batch?.name ?? 'N/A'}</span>
                </TableCell>

                {/* N° de requisición */}
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    {article.requisition_order_number ? (
                        <Link
                            href={`/${selectedCompany?.slug}/general/requisiciones/${article.requisition_order_number}`}
                            className="text-sm font-medium hover:underline"
                        >
                            {article.requisition_order_number}
                        </Link>
                    ) : (
                        <span className="text-sm font-medium">N/A</span>
                    )}
                </TableCell>

                <TableCell className="text-center">
                    <span className="text-sm font-medium">{article.reception_date ?? 'N/A'}</span>
                </TableCell>

                {/* Ubicación */}
                <TableCell className="text-center">
                    {location ? (
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <MapPin className="size-3 shrink-0" />
                            <span className="text-xs">{location.address}</span>
                            {location.cod_iata && (
                                <span className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                                    {location.cod_iata}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground/40">N/A</span>
                    )}
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center">
                    <span className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide',
                        isReception
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                            : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60'
                    )}>
                        {TRANSIT_STATUS_LABELS[status ?? ''] ?? 'Sin estado'}
                    </span>
                </TableCell>

                {/* Detalle */}
                <TableCell className="w-10 text-center" onClick={(e) => e.stopPropagation()}>
                    <ArticleDetailDialog article={article} />
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    {isReception && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            disabled={pending}
                            onClick={handleMoveToIncoming}
                        >
                            {pending ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <>
                                    <ArrowRight className="size-3" />
                                    Incoming
                                </>
                            )}
                        </Button>
                    )}
                </TableCell>
            </TableRow>

            {/* Sub-fila expandible */}
            {expanded && hasExtra && (
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={9} className="p-0 border-b border-border/40">
                        <div className="pl-10 pr-4 py-3 bg-muted/20 border-l-2 border-amber-300 dark:border-amber-700/60">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                                {article.manufacturer && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground font-medium">Fabricante:</span>
                                        <span className="font-semibold">{article.manufacturer.name}</span>
                                    </div>
                                )}
                                {article.condition && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground font-medium">Condición:</span>
                                        <span className="font-semibold">{article.condition.name}</span>
                                    </div>
                                )}
                                {article.quantity != null && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground font-medium">Cantidad:</span>
                                        <span className="font-semibold tabular-nums">
                                            {article.quantity}
                                            {article.unit && (
                                                <span className="ml-1 font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                                                    {article.unit}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
})

// ── Tab ──────────────────────────────────────────────────────────────
export function ArticulosEnTransitoTab() {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')

    const { data: transitArticles, isLoading: loadingTransit } = useGetArticlesByStatus('TRANSIT')
    const { data: receptionArticles, isLoading: loadingReception } = useGetArticlesByStatus('RECEPTION')

    const isLoading = loadingTransit || loadingReception

    const articles = useMemo<TransitArticle[]>(() => {
        const transit = (transitArticles as TransitArticle[]) ?? []
        const reception = (receptionArticles as TransitArticle[]) ?? []

        let combined: TransitArticle[]
        if (statusFilter === 'TRANSIT') combined = transit
        else if (statusFilter === 'RECEPTION') combined = reception
        else combined = [...transit, ...reception]

        if (!search.trim()) return combined

        const q = search.trim().toLowerCase()
        return combined.filter(
            (a) =>
                a.part_number?.toLowerCase().includes(q) ||
                a.alternative_part_number?.toLowerCase().includes(q) ||
                a.batch?.name?.toLowerCase().includes(q) ||
                a.batch?.warehouse?.location?.address?.toLowerCase().includes(q)
        )
    }, [transitArticles, receptionArticles, statusFilter, search])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        )
    }

    const totalTransit = (transitArticles as TransitArticle[])?.length ?? 0
    const totalReception = (receptionArticles as TransitArticle[])?.length ?? 0

    return (
        <div className="flex flex-col gap-y-3">
            {/* Encabezado */}
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Artículos en Tránsito</h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'}
                    </span>
                    <DownloadReportDialog
                        endpoint="articles-reception-pdf"
                        title="Descargar Reporte de Artículos en Recepción"
                        description="Selecciona el rango de fechas de recepción para filtrar los artículos."
                        dateRangeLabel="Rango de Fechas de Recepción"
                        fileNamePrefix="articulos_en_recepcion"
                    />
                </div>
            </div>

            {/* Filtros + búsqueda */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-md border border-border overflow-hidden">
                    {([
                        { value: 'ALL', label: 'Todos', count: totalTransit + totalReception },
                        { value: 'TRANSIT', label: 'Tránsito', count: totalTransit },
                        { value: 'RECEPTION', label: 'Recepción', count: totalReception },
                    ] as { value: StatusFilter; label: string; count: number }[]).map(({ value, label, count }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0',
                                statusFilter === value
                                    ? value === 'TRANSIT'
                                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                                        : value === 'RECEPTION'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
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
                        placeholder="Buscar parte, nombre, ubicación..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs w-64"
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-6 p-0" />
                            <TableHead className="text-xs text-center">N° de Parte / Alterno</TableHead>
                            <TableHead className="text-xs text-center">Descripción</TableHead>
                            <TableHead className="text-xs text-center">Solicitud de Compra</TableHead>
                            <TableHead className="text-xs text-center">Fecha de Recepción</TableHead>
                            <TableHead className="text-xs text-center">Ubicación</TableHead>
                            <TableHead className="text-xs text-center">Estado</TableHead>
                            <TableHead className="w-10 text-center" />
                            <TableHead className="text-xs text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.length > 0 ? (
                            articles.map((article) => (
                                <ArticleRow
                                    key={article.id}
                                    article={article}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
                                    No se encontraron artículos
                                    {statusFilter !== 'ALL' && ` con estado ${statusFilter}`}
                                    {search && ` que coincidan con "${search}"`}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
