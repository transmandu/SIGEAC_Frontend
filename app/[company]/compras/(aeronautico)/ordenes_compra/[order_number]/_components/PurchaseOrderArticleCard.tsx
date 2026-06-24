'use client';

import { Badge } from '@/components/ui/badge';
import type { PurchaseOrderArticle } from '@/types/purchase/purchase-order';

interface PurchaseOrderArticleCardProps {
  article: PurchaseOrderArticle;
}

const Field = ({ label, value, mono = false, pending = false }: { label: string; value?: string | number | null; mono?: boolean; pending?: boolean }) => (
  <div className="flex flex-col items-start min-w-0">
    <span className="text-[9px] uppercase tracking-wide text-muted-foreground select-none mb-0.5">
      {label}
    </span>
    {pending ? (
      <span className="text-xs text-muted-foreground/50 italic leading-none">Pendiente</span>
    ) : (
      <span className={`text-xs leading-none truncate w-full ${mono ? 'font-mono' : ''}`}>
        {value ?? '—'}
      </span>
    )}
  </div>
);

const PurchaseOrderArticleCard = ({ article }: PurchaseOrderArticleCardProps) => {
  const quoteArticle = article.article_quote_order;
  const req = quoteArticle?.article_requisition_order;
  const amount = Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0);

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/25 px-2.5 py-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0 text-[9px] px-1 py-[1px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
            P/N
          </span>
          <span className="truncate text-xs font-medium text-foreground">
            {req?.article_part_number || 'N/A'}
          </span>
        </div>
        {article.batch?.category && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none shrink-0"
          >
            {article.batch.category}
          </Badge>
        )}
      </div>

      {/* BODY */}
      <div className="px-2.5 py-2 space-y-1.5">

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="Descripción" value={article.batch?.name ?? req?.batch?.name ?? 'Sin Descripción'} />
          <Field label="P/N Alterno" value={req?.article_alt_part_number} mono />
          <Field label="Cantidad" value={quoteArticle?.quantity} />
          <Field label="Unidad" value={article.unit?.label} />
          <Field label="P. Unitario" value={`$${Number(quoteArticle?.unit_price || 0).toFixed(2)}`} />
          <Field label="Total" value={`$${amount.toFixed(2)}`} />
          <Field
            label="Tracking Nacional"
            value={article.shipping_tracking}
            mono
            pending={!article.shipping_tracking}
          />
          <Field
            label="Tracking Int'l"
            value={article.international_shipping_tracking}
            mono
            pending={!article.international_shipping_tracking}
          />
        </div>

      </div>

      {/* JUSTIFICACIÓN */}
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

    </div>
  );
};

export default PurchaseOrderArticleCard;
