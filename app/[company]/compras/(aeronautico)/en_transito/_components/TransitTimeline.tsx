"use client";

import {
  calendarDayNumber,
  instantToCalendarDay,
  relativeDayLabel,
} from "@/lib/date";
import type { TransitUpdate } from "@/types/purchase";
import { TransitUpdateEntry } from "./TransitUpdateEntry";

interface Props {
  /** De la más reciente a la más antigua, como las entrega el servidor. */
  updates: TransitUpdate[];
  articleId: number;
  timeZone: string;
  readOnly?: boolean;
}

const plural = (count: number, one: string, other: string) =>
  `${count} ${count === 1 ? one : other}`;

type Row =
  | { type: "day"; key: string; label: string; since?: string }
  | { type: "entry"; update: TransitUpdate; latest: boolean };

/**
 * El recorrido del envío como una línea de tiempo: una columna con un nodo por
 * novedad, agrupadas por día. Cada día lleva su fecha y cuánto pasó desde el
 * día anterior con novedades, para que se lea de un vistazo si el envío se
 * movió o estuvo callado.
 */
export function TransitTimeline({
  updates,
  articleId,
  timeZone,
  readOnly = false,
}: Props) {
  const today = instantToCalendarDay(new Date(), timeZone) ?? "";

  const rows: Row[] = [];
  let previousDay: string | null = null;

  updates.forEach((update, index) => {
    const key = instantToCalendarDay(update.occurred_at, timeZone) ?? "";

    if (key !== previousDay) {
      // El día anterior en la lista es el MÁS RECIENTE: lo que se cuenta es
      // cuánto pasó entre este día y el que le sigue.
      const newerDay: string | null = previousDay;
      const gap =
        newerDay && key
          ? Math.round(calendarDayNumber(newerDay) - calendarDayNumber(key))
          : 0;

      rows.push({
        type: "day",
        key,
        label: key ? relativeDayLabel(key, today) : "Sin fecha",
        since:
          newerDay && gap >= 1
            ? `${plural(gap, "día", "días")} antes`
            : undefined,
      });
      previousDay = key;
    }

    rows.push({ type: "entry", update, latest: index === 0 });
  });

  // Cada fila trae su tramo de línea (de borde a borde de la fila) y el nodo
  // se dibuja encima. La primera arranca en su nodo y la última termina en él,
  // para que la línea no sobresalga de los extremos.
  const rowClass =
    "relative pl-12 before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:-translate-x-1/2 before:bg-border first:before:top-3 last:before:bottom-auto last:before:h-4";

  return (
    <ol className="list-none">
      {rows.map((row, index) =>
        row.type === "day" ? (
          <li
            key={`day-${row.key}-${index}`}
            className={`${rowClass} ${index === 0 ? "pb-3" : "pb-3 pt-1"}`}
          >
            <span
              aria-hidden
              className="absolute left-4 top-1.5 z-10 size-2.5 -translate-x-1/2 rounded-full border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
            />
            <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
              <span className="font-semibold text-foreground/80 first-letter:uppercase">
                {row.label}
              </span>
              {row.since && (
                <span className="text-xs text-muted-foreground">
                  · {row.since}
                </span>
              )}
            </p>
          </li>
        ) : (
          <li key={row.update.id} className={`${rowClass} pb-5 last:pb-0`}>
            <TransitUpdateEntry
              update={
                readOnly ? { ...row.update, can_modify: false } : row.update
              }
              articleId={articleId}
              timeZone={timeZone}
              isLatest={row.latest}
            />
          </li>
        ),
      )}
    </ol>
  );
}
