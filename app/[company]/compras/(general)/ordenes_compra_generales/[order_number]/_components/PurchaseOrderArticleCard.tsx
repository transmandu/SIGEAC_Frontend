'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PurchaseOrderArticle, PurchaseOrderStatus } from '@/types/purchase/purchase-order';

interface PurchaseOrderArticleCardProps {
  article: PurchaseOrderArticle;
  orderStatus?: PurchaseOrderStatus;
}

const Field = ({ label, value, mono = false, pending = false, completed = false }: { label: string; value?: string | number | null; mono?: boolean; pending?: boolean; completed?: boolean }) => {
  const isEmpty = pending || value == null || value === '';

  return (
    <div className="flex flex-col items-start min-w-0">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground select-none mb-0.5">
        {label}
      </span>
      {isEmpty ? (
        completed ? (
          <span className="text-xs text-muted-foreground/50 leading-none">N/A</span>
        ) : pending ? (
          <span className="text-xs text-muted-foreground/50 italic leading-none">Pendiente</span>
        ) : (
          <span className="text-xs text-muted-foreground/50 leading-none">—</span>
        )
      ) : (
        <span className={`text-xs leading-none truncate w-full ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
};

const PurchaseOrderArticleCard = ({ article, orderStatus }: PurchaseOrderArticleCardProps) => {
  const isCompleted = orderStatus === 'COMPLETED';
  const [expanded, setExpanded] = useState(false);

  const quoteArticle = article.article_quote_order;
  const req = quoteArticle?.article_requisition_order;
  const batchName = req?.batch?.name ?? 'Sin lote';
  const batchCategory = req?.batch?.category;
  const unitLabel = quoteArticle?.unit?.label ?? req?.unit?.label;
  const conditionName = quoteArticle?.condition?.name;
  const vendorName = quoteArticle?.vendor?.name;

  const quotedTotal = quoteArticle?.total != null
    ? Number(quoteArticle.total)
    : Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0);
  const amount = article.total != null ? Number(article.total) : quotedTotal;
  const totalDiffers = article.total != null && Number(article.total) !== quotedTotal;

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden flex flex-col">

      {/* HEADER — siempre visible, resumen mínimo */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 border-b border-border/50 bg-muted/25 px-2.5 py-1.5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-xs font-semibold text-foreground">
            {batchName}
          </span>
          {batchCategory && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none shrink-0 hover:bg-secondary"
            >
              {batchCategory}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold tabular-nums">
            ${amount.toFixed(2)}
          </span>
          <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <>
          {/* BODY */}
          <div className="px-2.5 py-2 space-y-1.5">

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <Field label="P/N" value={req?.article_part_number} mono completed={isCompleted} />
              <Field label="P/N Alterno" value={req?.article_alt_part_number} mono completed={isCompleted} />
              <Field label="Cantidad" value={quoteArticle?.quantity} completed={isCompleted} />
              <Field label="Unidad" value={unitLabel} completed={isCompleted} />
              <Field label="P. Unitario" value={`$${Number(quoteArticle?.unit_price || 0).toFixed(2)}`} completed={isCompleted} />
              <Field label="Total" value={`$${amount.toFixed(2)}${totalDiffers ? ` (cotizado $${quotedTotal.toFixed(2)})` : ''}`} completed={isCompleted} />
              <Field label="Proveedor" value={vendorName} completed={isCompleted} />
              <Field label="Condición" value={conditionName} completed={isCompleted} />
              <Field
                label="Tracking Nacional"
                value={article.shipping_tracking}
                mono
                pending={!article.shipping_tracking}
                completed={isCompleted}
              />
              <Field
                label="Tracking Int'l"
                value={article.international_shipping_tracking}
                mono
                pending={!article.international_shipping_tracking}
                completed={isCompleted}
              />
            </div>

          </div>

          {/* JUSTIFICACIÓN (cotización) */}
          {quoteArticle?.justification && (
            <div className="border-t border-border/50 bg-muted/20 px-2.5 py-1">
              <span className="select-none text-[9px] leading-none text-muted-foreground uppercase">
                Justificación
              </span>
              <p className="mt-0.5 text-xs text-foreground/80 line-clamp-2">
                {quoteArticle.justification}
              </p>
            </div>
          )}

          {/* JUSTIFICACIÓN DE DIFERENCIA DE TOTAL (pago) */}
          {article.total_justification && (
            <div className="border-t border-amber-500/30 bg-amber-50/40 px-2.5 py-1 dark:bg-amber-900/10">
              <span className="select-none text-[9px] leading-none text-amber-700 dark:text-amber-400 uppercase">
                Justificación de diferencia de total
              </span>
              <p className="mt-0.5 text-xs text-foreground/80 line-clamp-2">
                {article.total_justification}
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default PurchaseOrderArticleCard;
