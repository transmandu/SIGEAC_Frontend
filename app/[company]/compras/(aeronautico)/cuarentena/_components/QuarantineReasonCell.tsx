"use client";

import { CalendarClock, Repeat2, User } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatQuarantineDate } from "@/lib/warehouse/quarantine";
import type { QuarantineRecord } from "@/types/quarantine";

/**
 * Cuando el rechazo sale de una inspección de entrada, el backend arma el
 * motivo juntando los puntos que fallaron:
 *
 *   "Rechazado en inspección — <punto>: <observación> · <punto>: <observación>"
 *
 * Esa cadena es útil entera pero ilegible en una celda, así que aquí se
 * separa en puntos para mostrar un resumen. El motivo que el inspector
 * escribe a mano no tiene esa forma y se muestra tal cual, recortado.
 */
const STRUCTURED = /^Rechazado en inspección\s*[—-]\s*([\s\S]+)$/;

/** La observación que el sistema pone cuando el inspector no escribió ninguna. */
const BOILERPLATE_OBSERVATION = /^falla detectada en inspecci[oó]n\.?$/i;

interface FailedPoint {
  label: string;
  observation: string;
}

const parsePoints = (reason: string): FailedPoint[] | null => {
  const match = reason.match(STRUCTURED);
  if (!match) return null;

  return match[1]
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const at = part.indexOf(": ");
      const label = at > 0 ? part.slice(0, at) : part;
      const observation = at > 0 ? part.slice(at + 2).trim() : "";

      return {
        label,
        observation: BOILERPLATE_OBSERVATION.test(observation)
          ? ""
          : observation,
      };
    });
};

export function QuarantineReasonCell({ record }: { record: QuarantineRecord }) {
  const attempts = record.cycles?.length ?? 0;
  const points = parsePoints(record.reason ?? "");

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="min-w-0 cursor-default space-y-1 text-left">
            {points ? (
              <>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Rechazado en inspección
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {points.length}{" "}
                    {points.length === 1 ? "punto fallido" : "puntos fallidos"}
                  </span>
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {points[0].label}
                  {points.length > 1 && ` y ${points.length - 1} más`}
                </p>
              </>
            ) : (
              <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
                {record.reason}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {record.inspector ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3" />
                {formatQuarantineDate(record.quarantine_entry_date)}
              </span>
              {attempts > 1 && (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                  <Repeat2 className="size-3" />
                  {attempts} intentos
                </span>
              )}
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-sm space-y-1.5 text-xs"
        >
          {points ? (
            <ul className="space-y-1.5">
              {points.map((point) => (
                <li key={point.label}>
                  <p className="font-medium">{point.label}</p>
                  {point.observation && (
                    <p className="text-muted-foreground">{point.observation}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-wrap">{record.reason}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
