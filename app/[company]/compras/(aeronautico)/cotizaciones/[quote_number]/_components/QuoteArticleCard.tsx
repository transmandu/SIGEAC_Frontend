'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ArticleQuoteOrder } from '@/types/purchase/quote';
import QuoteComparisonToggle from '@/components/misc/QuoteComparisonToggle';

interface QuoteArticleCardProps {
  article: ArticleQuoteOrder;
}

// ── Shared column widths so row 1 and row 2 fields line up vertically ──────
const FIELDS_GRID_COLS = 'grid-cols-[55px_120px_90px_100px]';

const QuoteArticleCard = ({ article }: QuoteArticleCardProps) => {
  const req = article.article_requisition_order;
  const amount = article.quantity * Number(article.unit_price);

  const quantityChanged = req != null && Number(req.quantity) !== Number(article.quantity);
  const unitChanged =
    req?.unit?.label != null &&
    article.unit?.label != null &&
    req.unit.label !== article.unit.label;

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden mx-3">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {req?.batch?.name ?? 'SIN LOTE'}
          </span>
          {req?.batch?.category && (
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none"
            >
              {req.batch.category}
            </Badge>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-3 py-3">
        <div className="grid grid-cols-[1fr_auto] gap-5 items-center">

          {/* IZQUIERDA */}
          <div className="min-w-0 space-y-2.5">

            {/* PART NUMBER */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                Part Number
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-teal-500/10 text-teal-700 border border-teal-500/20 font-medium select-none">
                  P/N
                </span>
                <div className="w-[300px] text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {req?.article_part_number || 'N/A'}
                </div>
              </div>
            </div>

            {/* ALT PART */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                Alternative Part Number
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[10px] px-1.5 py-[2px] rounded bg-slate-500/10 text-slate-600 border border-slate-500/20 font-medium select-none">
                  ALT
                </span>
                <div className="w-[300px] text-[11px] border border-dashed border-border/40 rounded px-2 py-1 truncate text-muted-foreground">
                  {req?.article_alt_part_number || 'N/A'}
                </div>
              </div>
            </div>

          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-6 shrink-0">

            {/* FILAS */}
            <div className="flex flex-col gap-2">

              {/* FILA 1: Cantidad · Proveedor · Lead time · Precio unitario */}
              <div className={cn('grid gap-x-5', FIELDS_GRID_COLS)}>

                {/* CANTIDAD */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Cantidad
                  </span>
                  <span className="text-sm tabular-nums leading-none block">
                    {article.quantity}
                  </span>
                </div>

                {/* PROVEEDOR */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Proveedor
                  </span>
                  <span className="text-sm leading-none block truncate w-full">
                    {article.vendor?.name ?? '—'}
                  </span>
                </div>

                {/* LEAD TIME */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Lead Time
                  </span>
                  <span className="text-sm text-muted-foreground leading-none block">
                    {article.lead_time ?? '—'}
                  </span>
                </div>

                {/* PRECIO UNITARIO */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    P. Unitario
                  </span>
                  <span className="text-sm tabular-nums leading-none block">
                    ${Number(article.unit_price).toFixed(2)}
                  </span>
                </div>

              </div>

              {/* FILA 2: Unidad · Condición · Referencia · Destino */}
              <div className={cn('grid gap-x-5', FIELDS_GRID_COLS)}>

                {/* UNIDAD */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Unidad
                  </span>
                  <span className="text-sm leading-none block">
                    {article.unit?.label ?? '—'}
                  </span>
                </div>

                {/* CONDICIÓN */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Condición
                  </span>
                  <span className="text-sm leading-none block">
                    {article.condition?.name ?? '—'}
                  </span>
                </div>

                {/* REFERENCIA */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Referencia
                  </span>
                  <span className="text-sm leading-none block truncate w-full">
                    {article.reference ?? '—'}
                  </span>
                </div>

                {/* DESTINO */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                    Destino
                  </span>
                  <span className="text-sm leading-none block truncate w-full">
                    {article.location?.address ?? '—'}
                  </span>
                </div>

              </div>

            </div>

            {/* TOTAL (separado horizontalmente, centrado verticalmente respecto a ambas filas) */}
            <div className="flex flex-col items-start min-w-[100px] pl-6 border-border/40 self-stretch justify-center">
              <span className="h-4 text-[10px] uppercase tracking-wide text-muted-foreground select-none mb-2 block">
                Total
              </span>
              <span className="text-sm font-semibold tabular-nums block">
                ${amount.toFixed(2)}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* COMPARATIVA SOLICITADO VS. COTIZADO + JUSTIFICACIÓN */}
      <QuoteComparisonToggle
        fields={[
          { label: 'Cantidad', requested: req?.quantity, quoted: article.quantity, changed: quantityChanged },
          { label: 'Unidad', requested: req?.unit?.label, quoted: article.unit?.label, changed: unitChanged },
        ]}
        justification={article.justification}
      />

    </div>
  );
};

export default QuoteArticleCard;
