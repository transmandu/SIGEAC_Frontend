"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";

import { TransitUpdatesDialog } from "@/app/[company]/compras/(aeronautico)/en_transito/_components/TransitUpdatesDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Acceso, desde la línea de una orden de compra, a la bitácora de tránsito de
 * su artículo físico. Solo consulta: las novedades se registran en "En
 * tránsito". Se ofrece cuando hay algo que consultar.
 */
export function PurchaseLineTransitUpdates({
  articleId,
  count = 0,
}: {
  articleId?: number | null;
  count?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!articleId || count === 0) return null;

  const label = `Bitácora del envío: ${count} ${count === 1 ? "novedad" : "novedades"}`;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={() => setOpen(true)}
            className="relative size-5 shrink-0 text-primary"
          >
            <NotebookPen className="size-3.5" />
            <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>

      {open && (
        <TransitUpdatesDialog
          articleId={articleId}
          open={open}
          onOpenChange={setOpen}
          readOnly
        />
      )}
    </>
  );
}
