'use client';

import { Badge } from '@/components/ui/badge';
import type { PurchaseOrderGeneralArticle, PurchaseOrderStatus } from '@/types/purchase/purchase-order';

interface PurchaseOrderGeneralArticleCardProps {
  article: PurchaseOrderGeneralArticle;
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

const INTAKE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Por confirmar',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  DELIVERED: 'Entregada',
};

const IntakeStatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return (
      <Badge
        variant="secondary"
        className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none shrink-0 hover:bg-secondary"
      >
        Sin entrega
      </Badge>
    );
  }

  const confirmed = status === 'CONFIRMED';
  const rejected = status === 'REJECTED';
  const delivered = status === 'DELIVERED';

  return (
    <Badge
      className={`h-4 px-1.5 text-[9px] font-semibold uppercase tracking-wide shrink-0 border shadow-none transition-colors duration-150 cursor-default ${
        confirmed
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
          : rejected
          ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15'
          : delivered
          ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15'
          : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15'
      }`}
    >
      {INTAKE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
};

const PurchaseOrderGeneralArticleCard = ({ article, orderStatus }: PurchaseOrderGeneralArticleCardProps) => {
  const isCompleted = orderStatus === 'COMPLETED';

  const quoteArticle = article.general_article_quote_order;
  const req = quoteArticle?.general_article_requisition_order;
  const unitLabel = quoteArticle?.unit?.label ?? req?.unit?.label;

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
        <div className="flex items-center gap-1 shrink-0">
          <IntakeStatusBadge status={article.general_article_intake?.status} />
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none shrink-0 hover:bg-secondary"
          >
            General
          </Badge>
        </div>
      </div>

      {/* BODY */}
      <div className="px-2.5 py-2 space-y-1.5">

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="Present. / Especif." value={req?.variant_type} completed={isCompleted} />
          <Field label="Marca / Modelo" value={quoteArticle?.brand_model} completed={isCompleted} />
          <Field label="Cantidad" value={quoteArticle?.quantity} completed={isCompleted} />
          <Field label="Unidad" value={unitLabel} completed={isCompleted} />
          <Field label="P. Unitario" value={`$${Number(quoteArticle?.unit_price || 0).toFixed(2)}`} completed={isCompleted} />
          <Field label="Total" value={`$${amount.toFixed(2)}${totalDiffers ? ` (cotizado $${quotedTotal.toFixed(2)})` : ''}`} completed={isCompleted} />
          <Field label="Lugar de compra" value={quoteArticle?.retailer?.name} completed={isCompleted} />
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

    </div>
  );
};

export default PurchaseOrderGeneralArticleCard;
