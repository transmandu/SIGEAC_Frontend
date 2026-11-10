"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GeneralArticleQuoteOrder } from "@/types/purchase/quote";
import QuoteComparisonToggle from "@/components/misc/QuoteComparisonToggle";

interface QuoteGeneralArticleCardProps {
  article: GeneralArticleQuoteOrder;
}

// ── Shared column widths so row 1 and row 2 fields line up vertically ──────
const FIELDS_GRID_COLS = "grid-cols-2 gap-y-3 sm:grid-cols-[55px_90px_100px]";

const QuoteGeneralArticleCard = ({ article }: QuoteGeneralArticleCardProps) => {
  const req = article.general_article_requisition_order;
  const amount = article.quantity * Number(article.unit_price);

  const quantityChanged =
    req != null && Number(req.quantity) !== Number(article.quantity);
  const unitChanged =
    req?.unit?.label != null &&
    article.unit?.label != null &&
    req.unit.label !== article.unit.label;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60 overflow-hidden mx-3">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/25 px-3 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {req?.description || "Artículo"}
          </span>
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-xs text-muted-foreground select-none"
          >
            General / Ferreteria
          </Badge>
        </div>
      </div>

      {/* BODY */}
      <div className="px-3 py-3">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-5">
          {/* IZQUIERDA */}
          <div className="min-w-0 space-y-2.5">
            {/* PRESENT. / ESPECIF. */}
            <div className="space-y-1">
              <span className="text-xs leading-none text-muted-foreground select-none">
                Present. / Especif.
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-full max-w-75 text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {req?.variant_type || "N/A"}
                </div>
              </div>
            </div>

            {/* MARCA / MODELO */}
            <div className="space-y-1">
              <span className="text-xs leading-none text-muted-foreground select-none">
                Marca / Modelo
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-full max-w-75 text-sm bg-muted/40 border border-border/40 rounded px-2 py-1 truncate">
                  {article.brand_model || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div className="flex flex-col gap-4 lg:shrink-0 lg:flex-row lg:items-center lg:gap-6">
            {/* FILAS */}
            <div className="flex flex-col gap-2">
              {/* FILA 1: Cantidad · Lead time · Precio unitario */}
              <div className={cn("grid gap-x-5", FIELDS_GRID_COLS)}>
                {/* CANTIDAD */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    Cantidad
                  </span>
                  <span className="text-sm tabular-nums leading-none block">
                    {article.quantity}
                  </span>
                </div>

                {/* LEAD TIME */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    Lead Time
                  </span>
                  <span className="text-sm leading-none block">
                    {article.lead_time ?? "—"}
                  </span>
                </div>

                {/* PRECIO UNITARIO */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    P. Unitario
                  </span>
                  <span className="text-sm tabular-nums leading-none block">
                    ${Number(article.unit_price).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* FILA 2: Unidad · Referencia · Destino */}
              <div className={cn("grid gap-x-5", FIELDS_GRID_COLS)}>
                {/* UNIDAD */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    Unidad
                  </span>
                  <span className="text-sm leading-none block">
                    {article.unit?.label ?? "—"}
                  </span>
                </div>

                {/* REFERENCIA */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    Referencia
                  </span>
                  <span className="text-sm leading-none block truncate w-full">
                    {article.reference ?? "—"}
                  </span>
                </div>

                {/* DESTINO */}
                <div className="flex flex-col items-start min-w-0">
                  <span className="h-4 text-xs text-muted-foreground select-none mb-2 block">
                    Destino
                  </span>
                  <span className="text-sm leading-none block truncate w-full">
                    {article.location?.address ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* TOTAL (separado horizontalmente, centrado verticalmente respecto a ambas filas) */}
            <div className="flex flex-row items-baseline justify-between gap-3 border-t border-border/40 pt-3 lg:min-w-25 lg:flex-col lg:items-start lg:justify-center lg:self-stretch lg:border-t-0 lg:pt-0 lg:pl-6">
              <span className="block text-xs text-muted-foreground select-none lg:mb-2 lg:h-4">
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
          {
            label: "Cantidad",
            requested: req?.quantity,
            quoted: article.quantity,
            changed: quantityChanged,
          },
          {
            label: "Unidad",
            requested: req?.unit?.label,
            quoted: article.unit?.label,
            changed: unitChanged,
          },
        ]}
        justification={article.justification}
      />
    </div>
  );
};

export default QuoteGeneralArticleCard;
