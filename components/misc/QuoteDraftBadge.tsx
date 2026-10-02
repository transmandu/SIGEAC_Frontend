"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOpenQuoteDraftEditor } from "@/components/dialogs/mantenimiento/compras/QuoteDraftEditorProvider";
import { cn } from "@/lib/utils";
import type { MyQuoteDraftSummary } from "@/types/purchase";

/**
 * Borrador de cotización propio, bajo el estado de la requisición.
 *
 * Comparte la métrica del badge de estado (mismo tamaño, borde y tipografía)
 * para que lean como una pila coherente, en ámbar porque es trabajo pendiente y
 * no un estado del documento. La burbuja cuenta los borradores: hoy siempre 1,
 * porque la BD garantiza a lo sumo uno por requisición y usuario, pero se pinta
 * desde el dato para que siga siendo cierta si eso cambia.
 *
 * Al pulsarlo abre el borrador, sin pasar por el listado de cotizaciones.
 */
export function QuoteDraftBadge({
  draft,
  count = 1,
}: {
  draft: MyQuoteDraftSummary;
  count?: number;
}) {
  const openDraft = useOpenQuoteDraftEditor();

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="relative inline-flex">
            <Badge
              className={cn(
                "whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-xs transition-colors duration-150 hover:scale-100 hover:translate-y-0",
                "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                "hover:bg-amber-500/15 dark:hover:text-amber-200",
                openDraft ? "cursor-pointer" : "cursor-default",
              )}
              onClick={(e) => {
                e.stopPropagation();
                openDraft?.(draft.id);
              }}
            >
              BORRADOR
            </Badge>

            {/* Burbuja del contador: se sale del badge, así que el disparador
                del tooltip es el span relativo y no el badge. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-background bg-amber-500 px-1 text-[9px] font-bold leading-none text-white tabular-nums shadow-xs dark:border-slate-900"
            >
              {count}
            </span>
          </span>
        </TooltipTrigger>

        <TooltipContent>
          Borrador de cotización sin emitir: {draft.lines_priced} de{" "}
          {draft.lines_total} con precio
          {draft.lines_pending > 0 && `, ${draft.lines_pending} sin responder`}.
          {/* Sin editor montado el badge solo informa, así que no se promete
              una acción que no va a ocurrir al pulsarlo. */}
          {openDraft ? " Pulse para continuarlo." : ""}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
