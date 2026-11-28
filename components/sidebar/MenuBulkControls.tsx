import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuBulkControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const BUTTON_CLASS =
  "flex size-7 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors duration-200 hover:border-border/70 hover:bg-muted/40 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20";

/**
 * Plegar y desplegar todo el menú de una vez. Solo el SUPERUSER, que es quien
 * puede plegar grupos, ve toda la lista y la necesita para orientarse.
 */
export function MenuBulkControls({
  onExpandAll,
  onCollapseAll,
}: MenuBulkControlsProps) {
  return (
    <div className="mx-2 flex h-7 items-center gap-1">
      <span className="h-px flex-1 bg-border/60" />

      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Desplegar todo"
              onClick={onExpandAll}
              className={BUTTON_CLASS}
            >
              <ChevronsUpDown className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-lg">
            Desplegar todo
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Plegar todo"
              onClick={onCollapseAll}
              className={BUTTON_CLASS}
            >
              <ChevronsDownUp className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="rounded-lg">
            Plegar todo
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
