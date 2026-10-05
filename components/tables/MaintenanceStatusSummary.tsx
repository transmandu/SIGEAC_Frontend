"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { STATUS_META, type ItemStatus } from "@/lib/maintenanceControlCalc";
import { MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Resumen de vencimientos de un control para el listado: un solo chip, el de la
 * franja más urgente que tenga ítems. El desglose completo va en el tooltip.
 */

export type StatusCounts = Record<ItemStatus, number>;

export const emptyStatusCounts = (): StatusCounts => ({
  OK: 0,
  WARNING: 0,
  CRITICAL: 0,
  OVERDUE: 0,
});

/** De más urgente a menos: la primera franja con ítems es la que manda el chip. */
const SEVERITY_ORDER: ItemStatus[] = ["OVERDUE", "CRITICAL", "WARNING", "OK"];

const itemsLabel = (count: number) =>
  count === 1 ? "1 ítem" : `${count} ítems`;

export function MaintenanceStatusSummary({ counts }: { counts: StatusCounts }) {
  const worst = SEVERITY_ORDER.find((status) => counts[status] > 0);

  // Sin ítems con plazo (todos por condición, o sin lectura inicial) no hay
  // estado que afirmar: no es lo mismo que estar vigente.
  if (!worst) {
    return (
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <MinusCircle className="h-3.5 w-3.5" />
              Sin plazos
            </span>
          </TooltipTrigger>
          <TooltipContent>
            No hay ítems con vencimiento calculado
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  const breakdown = SEVERITY_ORDER.filter((status) => counts[status] > 0);

  return (
    <div className="flex justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium tabular-nums",
              STATUS_META[worst].text,
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", STATUS_META[worst].dot)}
            />
            {counts[worst]} {STATUS_META[worst].label}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            {breakdown.map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    STATUS_META[status].dot,
                  )}
                />
                <span>
                  {itemsLabel(counts[status])} · {STATUS_META[status].label}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
