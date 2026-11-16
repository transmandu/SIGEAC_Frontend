"use client";

import { TransitUpdatesReadOnlyDialog } from "@/components/dialogs/mantenimiento/almacen/TransitUpdatesReadOnlyDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TransitArticle } from "@/types/purchase/in-transit";
import { NotebookPen } from "lucide-react";
import { useState } from "react";

/**
 * Acceso a la bitácora de tránsito del artículo, solo para consulta: la
 * escribe compras desde su pantalla.
 */
export function TransitUpdatesButton({ article }: { article: TransitArticle }) {
  const [open, setOpen] = useState(false);

  const count = article.transit_updates_count ?? 0;
  const idle = article.transit_idle;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                count > 0
                  ? `Bitácora de tránsito, ${count} ${count === 1 ? "novedad" : "novedades"}`
                  : "Bitácora de tránsito"
              }
              className={cn(
                "relative h-7 w-7",
                idle
                  ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  : count > 0
                    ? "text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setOpen(true)}
            >
              <NotebookPen className="size-4" />
              {(count > 0 || idle) && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white",
                    idle ? "bg-amber-500" : "bg-sky-600",
                  )}
                >
                  {count > 9 ? "9+" : count > 0 ? count : "!"}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {idle
              ? `Sin noticias del envío hace ${article.transit_idle_days} días`
              : count > 0
                ? "Ver la bitácora de tránsito"
                : "Sin novedades de tránsito"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <TransitUpdatesReadOnlyDialog
          articleId={article.id}
          description={article.batch?.name}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
