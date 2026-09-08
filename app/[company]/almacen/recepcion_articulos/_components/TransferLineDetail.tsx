'use client'

import { memo } from 'react'

import { Badge } from '@/components/ui/badge'
import type { IncomingTransfer } from '@/hooks/mantenimiento/almacen/solicitudes/useGetIncomingTransfers'

type TransferLine = IncomingTransfer['articles_dispatch'][number]

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-1.5">
        <span className="font-medium text-muted-foreground">{label}:</span>
        {children}
    </div>
)

/**
 * Lo que hace falta para reconocer el material antes de acusarlo.
 *
 * El número de parte no basta: quien recibe compara contra lo que tiene
 * físicamente delante, y para eso necesita la descripción, de qué tipo es, con
 * qué identificador viaja y en qué condición llegó. Ese identificador depende
 * del tipo: lo serializado trae serial, el consumible número de lote.
 *
 * Es el mismo bloque en la lista y en el diálogo de acuse: lo que se revisa al
 * mirar el traslado es lo mismo que se confirma al recibirlo.
 */
export const TransferLineDetail = memo(function TransferLineDetail({
    line,
}: {
    line: TransferLine
}) {
    const article = line.article
    const general = line.general_article
    const batch = article?.batch

    const identifier = article?.serial ?? article?.consumable?.lot_number ?? null
    const identifierLabel = article?.serial ? 'Serial' : 'Lote'

    const quantity = line.dispatch_quantity ?? line.quantity
    const unit =
        line.dispatch_unit?.label
        ?? article?.consumable?.primary_unit?.label
        ?? general?.general_primary_unit?.label
        ?? null

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-md border border-border/40 bg-background/60 px-3 py-2 text-xs">
            <Field label="P/N">
                <span className="font-mono font-semibold">
                    {article?.part_number ?? general?.description ?? 'Sin identificar'}
                </span>
            </Field>

            <Field label="Descripción">
                <span className="font-semibold">
                    {batch?.name?.trim() || general?.brand_model?.trim() || 'N/A'}
                </span>
            </Field>

            {identifier && (
                <Field label={identifierLabel}>
                    <span className="font-mono font-semibold">{identifier}</span>
                </Field>
            )}

            <Field label="Cantidad">
                <span className="font-semibold tabular-nums">
                    {quantity}
                    {unit && (
                        <span className="ml-1 rounded border border-border/40 bg-muted/60 px-1 py-0.5 font-mono text-[10px]">
                            {unit}
                        </span>
                    )}
                </span>
            </Field>

            {article?.condition?.name && (
                <Field label="Condición">
                    <span className="font-semibold">{article.condition.name}</span>
                </Field>
            )}

            {batch?.category && (
                <Badge
                    variant="outline"
                    className="ml-auto shrink-0 rounded px-1.5 py-0 text-[10px] font-medium"
                >
                    {batch.category}
                </Badge>
            )}
        </div>
    )
})
