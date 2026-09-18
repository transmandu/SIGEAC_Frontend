"use client";

import { useMemo } from "react";
import { eachDayOfInterval, endOfMonth, endOfWeek, format, max, min, startOfMonth, startOfWeek } from "date-fns";

import { DayCell } from "./DayCell";
import { LocalCalendarEvent } from "./types";

const WEEKDAY_HEADERS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

interface MonthGridProps {
  month: Date;
  events: LocalCalendarEvent[];
  canEdit: boolean;
  shortLabels: Record<string, string>;
  onSelectEvent: (event: LocalCalendarEvent) => void;
}

/** "yyyy-MM-dd" propio (no toISOString): un Date de medianoche local no se corre de día al armar la clave, a diferencia de convertir a UTC primero. */
export function dayKeyOf(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function MonthGrid({ month, events, canEdit, shortLabels, onSelectEvent }: MonthGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Siempre 42 celdas (6 semanas): mantiene la grilla del mismo alto sin
  // importar cuántas semanas tenga el mes real, así las 6 filas se reparten
  // el alto disponible de forma predecible (minmax(0,1fr) por fila).
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  // Un evento multi-día se repite como chip en CADA día que ocupa (decisión
  // de diseño: más simple que una barra continua tipo Google Calendar, sin
  // posicionamiento absoluto ni cálculo de carriles). Se clampea al rango
  // visible de la grilla para no iterar de más en eventos muy largos.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, LocalCalendarEvent[]>();

    for (const event of events) {
      const clampedStart = max([event.start, gridStart]);
      const clampedEnd = min([event.end, gridEnd]);
      if (clampedStart > clampedEnd) continue;

      for (const day of eachDayOfInterval({ start: clampedStart, end: clampedEnd })) {
        const key = dayKeyOf(day);
        const list = map.get(key);
        if (list) list.push(event);
        else map.set(key, [event]);
      }
    }

    return map;
  }, [events, gridStart, gridEnd]);

  return (
    // grid-rows-[auto_repeat(6,minmax(0,1fr))]: la fila de encabezado toma
    // su alto natural y las 6 filas de semana se reparten TODO el resto en
    // partes iguales — grid-auto-flow (por defecto "row") ya envuelve los 42
    // DayCell de a 7 por fila sin necesitar un <div> contenedor por semana.
    <div className="grid h-full min-h-0 grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))]">
      {WEEKDAY_HEADERS.map((label) => (
        <div
          key={label}
          className="border-b border-slate-400/30 pb-1.5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground dark:border-slate-600/30"
        >
          {label}
        </div>
      ))}

      {days.map((day) => {
        const key = dayKeyOf(day);

        return (
          <DayCell
            key={key}
            day={day}
            dayKey={key}
            events={eventsByDay.get(key) ?? []}
            monthStart={monthStart}
            canEdit={canEdit}
            shortLabels={shortLabels}
            onSelectEvent={onSelectEvent}
          />
        );
      })}
    </div>
  );
}
