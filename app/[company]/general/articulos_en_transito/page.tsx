
'use client'

import { useUpdateArticleStatus } from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { ContentLayout } from '@/components/layout/ContentLayout'
import BackButton from '@/components/misc/BackButton'
import LoadingPage from '@/components/misc/LoadingPage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useGetArticlesByStatus } from '@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronRight, Loader2, MapPin, PackageCheck, Search, ShieldOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Condition, Manufacturer } from '@/types'

// Tipo que refleja la estructura real devuelta por el backend
type TransitArticle = {
    id: number
    part_number: string
    alternative_part_number?: string | null
    serial?: string | null
    ata_code?: string | null
    status: string
    batch_id: string
    condition?: Condition;
    manufacturer?: Manufacturer;
    quantity: number;
    unit?: string;
    batch: {
        id: number
        name: string
        warehouse?: {
            id: number
            name: string
            location?: {
                id: number
                address: string
                cod_iata?: string
            }
        }
    }
}

type StatusFilter = 'ALL' | 'TRANSIT' | 'RECEPTION'

// ── Fila de artículo ───────────────────────────────────────────────────
function ArticleRow({ article }: { article: TransitArticle; company: string }) {
    const { updateArticleStatus } = useUpdateArticleStatus()
    const [pending, setPending] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const status = article.status?.toLowerCase()
    const isReception = status === 'reception'
    const isTransit = status === 'transit'

    const handleAction = async () => {
        setPending(true)
        if (isTransit) {
            await updateArticleStatus.mutateAsync({ id: article.id, status: 'RECEPTION' })
        } else if (isReception) {
            await updateArticleStatus.mutateAsync({ id: article.id, status: 'INCOMING' })
        }
        setPending(false)
    }

    const location = article.batch?.warehouse?.location

    const hasExtra = article.condition || article.manufacturer || article.quantity != null || article.unit

    return (
        <>
            <TableRow className="hover:bg-muted/30 transition-colors">
                {/* Expand toggle */}
                <TableCell className="w-8 pr-0">
                    {hasExtra && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="flex items-center justify-center rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            <ChevronRight className={cn(
                                'size-3.5 transition-transform duration-150',
                                expanded && 'rotate-90 text-amber-600 dark:text-amber-500'
                            )} />
                        </button>
                    )}
                </TableCell>

                {/* Parte / Alterno */}
                <TableCell>
                    <div className="space-y-1 min-w-0">
                        <div className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 w-fit tracking-wide">
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
                                ALT —
                            </span>
                        )}
                    </div>
                </TableCell>

                {/* Nombre del batch */}
                <TableCell>
                    <span className="text-sm font-medium">{article.batch?.name ?? '—'}</span>
                </TableCell>

                {/* Ubicación */}
                <TableCell>
                    {location ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="size-3 shrink-0" />
                            <span className="text-xs">{location.address}</span>
                            {location.cod_iata && (
                                <span className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                                    {location.cod_iata}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                </TableCell>

                {/* Estado */}
                <TableCell>
                    <span className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wide',
                        isReception
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                            : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60'
                    )}>
                        {article.status}
                    </span>
                </TableCell>

                {/* Acciones */}
                <TableCell>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        disabled={pending}
                        onClick={handleAction}
                    >
                        {pending ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : isReception ? (
                            <>
                                <ArrowRight className="size-3" />
                                Incoming
                            </>
                        ) : (
                            <>
                                <PackageCheck className="size-3" />
                                Recepción
                            </>
                        )}
                    </Button>
                </TableCell>
            </TableRow>

            {/* Sub-fila expandible */}
            {expanded && hasExtra && (
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="p-0 border-b border-border/40">
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
}

const ALMACEN_ROLES = ['ALMACEN', 'JEFE_ALMACEN', 'ANALISTA_ALMACEN', 'SUPERUSER']

// ── Página ─────────────────────────────────────────────────────────────
const EnTransitoPage = () => {
    const { selectedCompany } = useCompanyStore()
    const { user } = useAuth()
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [search, setSearch] = useState('')

    const userRoles = user?.roles?.map((r) => r.name) ?? []
    const canView = ALMACEN_ROLES.some((r) => userRoles.includes(r))

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

    if (isLoading) return <LoadingPage />

    if (!canView) {
        return (
            <ContentLayout title="Artículos en Tránsito">
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                    <ShieldOff className="size-10" />
                    <p className="text-sm font-medium">No tienes permiso para ver esta sección.</p>
                    <p className="text-xs">Se requiere el rol de Almacén.</p>
                </div>
            </ContentLayout>
        )
    }

    const totalTransit = (transitArticles as TransitArticle[])?.length ?? 0
    const totalReception = (receptionArticles as TransitArticle[])?.length ?? 0

    return (
        <ContentLayout title="Artículos en Tránsito">
            <div className="flex flex-col gap-y-3">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2">
                    <BackButton iconOnly tooltip="Volver" variant="secondary" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/${selectedCompany?.slug ?? ''}/dashboard`}>
                                    Inicio
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>Compras</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Art. en Tránsito</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Encabezado */}
                <div className="flex items-baseline justify-between">
                    <h1 className="text-2xl font-bold">Artículos en Tránsito</h1>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'}
                    </span>
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
                                <TableHead className="w-8" />
                                <TableHead className="text-xs">Numero de Parte / Alterno</TableHead>
                                <TableHead className="text-xs">Descripcion</TableHead>
                                <TableHead className="text-xs">Ubicación</TableHead>
                                <TableHead className="text-xs">Estado</TableHead>
                                <TableHead className="text-xs">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.length > 0 ? (
                                articles.map((article) => (
                                    <ArticleRow
                                        key={article.id}
                                        article={article}
                                        company=""
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
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
        </ContentLayout>
    )
}

export default EnTransitoPage
