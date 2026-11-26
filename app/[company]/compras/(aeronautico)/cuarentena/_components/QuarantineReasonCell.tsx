"use client";

import {
  CalendarClock,
  CircleHelp,
  ListChecks,
  MessageSquareText,
  Repeat2,
  User,
} from "lucide-react";

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

  const points = match[1]
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

  // Sin ningún punto legible (solo espacios o separadores) se muestra el texto
  // tal cual: la celda y el tooltip dan por hecho que hay al menos uno.
  return points.length > 0 ? points : null;
};

export function QuarantineReasonCell({ record }: { record: QuarantineRecord }) {
  const attempts = record.cycles?.length ?? 0;
  const points = parsePoints(record.reason ?? "");

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="min-w-0 cursor-default space-y-1 text-left">
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              {points ? (
                <>
                  <ListChecks aria-hidden className="size-4 shrink-0" />
                  Rechazado en inspección
                  <span className="font-normal text-muted-foreground">
                    ·{" "}
                    {points.length === 1
                      ? "1 punto fallido"
                      : `${points.length} puntos fallidos`}
                  </span>
                </>
              ) : (
                <>
                  <MessageSquareText aria-hidden className="size-4 shrink-0" />
                  Observación del inspector
                </>
              )}
            </p>

            <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
              {points ? (
                <>
                  {points[0].label}
                  {points.length > 1 && (
                    <span className="text-muted-foreground">
                      {" "}
                      y {points.length - 1} más
                    </span>
                  )}
                </>
              ) : (
                record.reason
              )}
            </p>

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
            <div className="space-y-2">
              <p className="flex items-start gap-1.5 font-medium">
                <CircleHelp aria-hidden className="mt-px size-3.5 shrink-0" />
                Puntos que no pasaron la inspección de entrada
              </p>
              <ol className="list-none space-y-1.5 border-t pt-2">
                {points.map((point, index) => (
                  <li key={`${index}-${point.label}`} className="flex gap-2">
                    <span
                      aria-hidden
                      className="grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold leading-none text-muted-foreground"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium wrap-anywhere">{point.label}</p>
                      {point.observation && (
                        <p className="text-muted-foreground wrap-anywhere">
                          {point.observation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="flex items-start gap-1.5 font-medium">
                <MessageSquareText
                  aria-hidden
                  className="mt-px size-3.5 shrink-0"
                />
                Observación del inspector
              </p>
              <p className="whitespace-pre-wrap border-t pt-2 wrap-anywhere">
                {record.reason}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
