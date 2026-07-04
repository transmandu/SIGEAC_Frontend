'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GeneralArticleQuoteOrder } from '@/types/purchase/quote';

interface QuoteGeneralArticleCardProps {
  article: GeneralArticleQuoteOrder;
}

// ── Shared column widths so row 1 and row 2 fields line up vertically ──────
const FIELDS_GRID_COLS = 'grid-cols-[80px_120px]';

const QuoteGeneralArticleCard = ({ article }: QuoteGeneralArticleCardProps) => {
  const req = article.general_article_requisition_order;
  const amount = article.quantity * Number(article.unit_price);

  return (
    <div className="rounded-lg border border-border/60 bg-background/70 overflow-hidden mx-3">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {req?.description || 'Artículo'}
          </span>
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] uppercase tracking-wide text-muted-foreground select-none"
          >
            General / Ferreteria
          </Badge>
        </div>
        {article.retailer?.name && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground select-none">
              Lugar de compra
            </span>
            <Badge
              variant="outline"
              className="h-4 px-1.5 text-[9px] font-medium text-foreground/80 select-none"
            >
              {article.retailer.name}
            </Badge>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="px-3 py-3">
        <div className="grid grid-cols-[1fr_auto] gap-5 items-center">

          {/* IZQUIERDA */}
          <div className="min-w-0 space-y-2.5">

            {/* PRESENT. / ESPECIF. */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                Present. / Especif.
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-[300px] text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {req?.variant_type || 'N/A'}
                </div>
              </div>
            </div>

            {/* MARCA / MODELO */}
            <div className="space-y-1">
              <span className="text-[10px] leading-none uppercase tracking-wide text-muted-foreground select-none">
                Marca / Modelo
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-[300px] text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {article.brand_model || 'N/A'}
                </div>
              </div>
            </div>

          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-6 shrink-0">

            {/* FILAS */}
            <div className="flex flex-col gap-2">

              {/* FILA 1: Cantidad · Precio unitario */}
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

              {/* FILA 2: Unidad · Destino */}
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

      {/* JUSTIFICACIÓN */}
      {article.justification && (
        <div className="border-t border-border/50 bg-muted/20 px-3 py-1.5">
          <span className="select-none text-[9px] leading-none text-muted-foreground uppercase">
            Justificación
          </span>
          <p className="mt-0.5 text-xs text-foreground/80">
            {article.justification}
          </p>
        </div>
      )}

    </div>
  );
};

export default QuoteGeneralArticleCard;
