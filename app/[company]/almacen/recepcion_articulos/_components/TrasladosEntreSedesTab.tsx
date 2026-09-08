'use client'

import { memo, useMemo, useState } from 'react'
import { ChevronRight, Loader2, PackageCheck, Search, Truck } from 'lucide-react'

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
import { cn } from '@/lib/utils'

import {
    useGetIncomingTransfers,
    type IncomingTransfer,
} from '@/hooks/mantenimiento/almacen/solicitudes/useGetIncomingTransfers'
import { AcknowledgeTransferDialog } from './AcknowledgeTransferDialog'
import { TransferLineDetail } from './TransferLineDetail'

// ── Fila ─────────────────────────────────────────────────────────────
const TransferRow = memo(function TransferRow({
    transfer,
    onConfirm,
}: {
    transfer: IncomingTransfer
    onConfirm: (transfer: IncomingTransfer) => void
}) {
    const [expanded, setExpanded] = useState(false)

    const lines = transfer.articles_dispatch ?? []
    // El detalle de lo que trae vive en la sub-fila, igual que en los otros
    // tabs: la fila principal responde "qué llegó y de dónde".
    const hasExtra = lines.length > 0

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
                            className="mx-auto flex items-center justify-center rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
                        >
                            <ChevronRight className={cn(
                                'size-3.5 transition-transform duration-150',
                                expanded && 'rotate-90 text-amber-600 dark:text-amber-500'
                            )} />
                        </button>
                    )}
                </TableCell>

                {/* Salida */}
                <TableCell className="text-center">
                    <div className="mx-auto w-fit rounded border border-border/40 bg-muted/60 px-1.5 py-0.5 font-mono text-[12px] font-semibold tracking-wide">
                        {transfer.request_number}
                    </div>
                </TableCell>

                {/* Sede de origen */}
                <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                        <Truck className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold">
                            {transfer.location?.cod_iata ?? 'N/A'}
                        </span>
                    </div>
                </TableCell>

                {/* Artículos */}
                <TableCell className="text-center">
                    <span className="text-xs tabular-nums">
                        {lines.length} {lines.length === 1 ? 'artículo' : 'artículos'}
                    </span>
                </TableCell>

                {/* Justificación */}
                <TableCell className="max-w-[220px] text-center">
                    <p className="truncate text-xs text-muted-foreground">
                        {transfer.justification || '—'}
                    </p>
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center">
                    <span className="select-none inline-block whitespace-nowrap rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-400">
                        EN TRÁNSITO
                    </span>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => onConfirm(transfer)}
                    >
                        <PackageCheck className="size-3" />
                        Confirmar
                    </Button>
                </TableCell>
            </TableRow>

            {/* Sub-fila expandible: qué trae exactamente */}
            {expanded && hasExtra && (
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="border-b border-border/40 p-0">
                        <div className="border-l-2 border-amber-300 bg-muted/20 py-3 pl-10 pr-4 dark:border-amber-700/60">
                            <div className="space-y-3">
                                {lines.map((line) => (
                                    <TransferLineDetail key={line.id} line={line} />
                                ))}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
})

// ── Tab ──────────────────────────────────────────────────────────────
/**
 * Material que otra sede envió hacia esta y espera confirmación de recibo.
 *
 * Vive junto a las demás recepciones porque recibir un traslado es recibir: la
 * diferencia con una compra es de dónde viene, no lo que el almacén hace con
 * ello. Mientras un traslado está en esta lista el material no cuenta en
 * ningún inventario —ya salió del almacén de origen y no entra al de esta sede
 * hasta que alguien confirma que llegó físicamente—.
 */
export function TrasladosEntreSedesTab() {
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<IncomingTransfer | null>(null)

    const { data: transfers = [], isLoading, isError } = useGetIncomingTransfers()

    const filtered = useMemo(() => {
        if (!search.trim()) return transfers

        const q = search.trim().toLowerCase()

        return transfers.filter(
            (transfer) =>
                transfer.request_number?.toLowerCase().includes(q) ||
                transfer.location?.cod_iata?.toLowerCase().includes(q) ||
                transfer.justification?.toLowerCase().includes(q) ||
                // Se busca por lo que la sub-fila muestra: si el lote y el
                // serial se ven, tienen que poder buscarse.
                transfer.articles_dispatch?.some(
                    (line) =>
                        line.article?.part_number?.toLowerCase().includes(q) ||
                        line.article?.serial?.toLowerCase().includes(q) ||
                        line.article?.batch?.name?.toLowerCase().includes(q) ||
                        line.article?.consumable?.lot_number?.toLowerCase().includes(q) ||
                        line.general_article?.description?.toLowerCase().includes(q),
                )
        )
    }, [transfers, search])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
            </div>
        )
    }

    const totalArticles = filtered.reduce(
        (sum, transfer) => sum + (transfer.articles_dispatch?.length ?? 0),
        0,
    )

    return (
        <div className="flex flex-col gap-y-3">
            {/* Encabezado */}
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Traslados entre Sedes</h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? 'traslado' : 'traslados'}
                    {totalArticles > 0 && ` · ${totalArticles} artículo(s)`}
                </span>
            </div>

            {/* Búsqueda */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative ml-auto">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar salida, sede, parte, lote, serial..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 w-64 pl-8 text-xs"
                    />
                </div>
            </div>

            {isError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="text-sm text-red-500">Error al cargar los traslados.</p>
                </div>
            )}

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-6 p-0" />
                            <TableHead className="text-center text-xs">Salida</TableHead>
                            <TableHead className="text-center text-xs">Sede de Origen</TableHead>
                            <TableHead className="text-center text-xs">Artículos</TableHead>
                            <TableHead className="text-center text-xs">Justificación</TableHead>
                            <TableHead className="text-center text-xs">Estado</TableHead>
                            <TableHead className="text-center text-xs">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((transfer) => (
                                <TransferRow
                                    key={transfer.id}
                                    transfer={transfer}
                                    onConfirm={setSelected}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                                    No hay artículos en camino hacia esta sede
                                    {search && ` que coincidan con "${search}"`}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selected && (
                <AcknowledgeTransferDialog
                    transfer={selected}
                    open={!!selected}
                    onOpenChange={(open) => !open && setSelected(null)}
                />
            )}
        </div>
    )
}
