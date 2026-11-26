"use client";

import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Remanente de un ítem de control: punto de estado, valor y, si el ítem define
 * su propio margen, ese porcentaje. El valor parte de línea en lugar de
 * cortarse ("Vencido (210 ciclos)" no cabe en una columna angosta) y el punto
 * y el porcentaje se anclan a la primera línea.
 */
export function RemainingValue({
  value,
  textClass,
  dotClass,
  ownPercentage,
  ownPercentageHint,
}: {
  value: string;
  textClass: string;
  dotClass: string;
  /** Margen propio del ítem; nulo si usa el del control. */
  ownPercentage?: number | string | null;
  ownPercentageHint: ReactNode;
}) {
  return (
    <span className={cn("flex items-start gap-1.5 font-semibold", textClass)}>
      <span
        aria-hidden
        className={cn("mt-2 size-1.5 shrink-0 rounded-full", dotClass)}
      />
      <span className="min-w-0 wrap-anywhere">{value}</span>
      {ownPercentage !== null && ownPercentage !== undefined && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mt-0.5 shrink-0 rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
              {Number(ownPercentage)}%
            </span>
          </TooltipTrigger>
          <TooltipContent>{ownPercentageHint}</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
