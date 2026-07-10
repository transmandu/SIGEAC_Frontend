'use client';

import { Badge } from '@/components/ui/badge';
import type { PurchaseOrderGeneralArticle } from '@/types/purchase/purchase-order';

interface PurchaseOrderGeneralArticleCardProps {
  article: PurchaseOrderGeneralArticle;
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

const PurchaseOrderGeneralArticleCard = ({ article }: PurchaseOrderGeneralArticleCardProps) => {
  const quoteArticle = article.general_article_quote_order;
  const req = quoteArticle?.general_article_requisition_order;
  const quotedTotal = quoteArticle?.total != null
    ? Number(quoteArticle.total)
    : Number(quoteArticle?.quantity || 0) * Number(quoteArticle?.unit_price || 0);
  const amount = article.total != null ? Number(article.total) : quotedTotal;
  const totalDiffers = article.total != null && Number(article.total) !== quotedTotal;

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/25 px-2.5 py-1">
        <span className="truncate text-xs font-medium text-foreground min-w-0">
          {req?.description || 'Artículo'}
        </span>
        <Badge
          variant="secondary"
          className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none shrink-0"
        >
          General
        </Badge>
      </div>

      {/* BODY */}
      <div className="px-2.5 py-2 space-y-1.5">

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="Present. / Especif." value={req?.variant_type} />
          <Field label="Marca / Modelo" value={quoteArticle?.brand_model} />
          <Field label="Cantidad" value={quoteArticle?.quantity} />
          <Field label="Unidad" value={req?.unit?.label} />
          <Field label="P. Unitario" value={`$${Number(quoteArticle?.unit_price || 0).toFixed(2)}`} />
          <Field label="Total" value={`$${amount.toFixed(2)}${totalDiffers ? ` (cotizado $${quotedTotal.toFixed(2)})` : ''}`} />
          <Field label="Lugar de compra" value={quoteArticle?.retailer?.name} />
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

    </div>
  );
};

export default PurchaseOrderGeneralArticleCard;
