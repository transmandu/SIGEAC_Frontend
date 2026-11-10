"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";

import { TransitUpdatesReadOnlyDialog } from "@/components/dialogs/mantenimiento/almacen/TransitUpdatesReadOnlyDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ArticleLifecycleStage } from "@/types/purchase";

/**
 * Acceso a la bitácora de tránsito desde la línea de una requisición, junto al
 * icono de etapa. Se ofrece mientras el artículo viene en camino y, después,
 * solo si dejó novedades que consultar.
 */
export default function TransitUpdatesLink({
  articleId,
  stage,
  count = 0,
}: {
  /** Artículo físico de la línea; sin él la línea aún no tiene bitácora. */
  articleId?: number | null;
  stage?: ArticleLifecycleStage | null;
  count?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!articleId || (stage !== "TRANSIT" && count === 0)) return null;

  const label =
    count > 0
      ? `Ver la bitácora del envío (${count} ${count === 1 ? "novedad" : "novedades"})`
      : "Ver la bitácora del envío";

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <NotebookPen className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-70 text-xs">
          {label}
        </TooltipContent>
      </Tooltip>

      {open && (
        <TransitUpdatesReadOnlyDialog
          articleId={articleId}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
