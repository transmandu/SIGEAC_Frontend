"use client";

import { useMemo } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  max,
  min,
  startOfMonth,
  startOfWeek,
} from "date-fns";

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

export function MonthGrid({
  month,
  events,
  canEdit,
  shortLabels,
  onSelectEvent,
}: MonthGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  // 5 semanas la mayoría de los meses, 6 quince veces por año: si la grilla
  // siempre reservara 6 filas, un mes de 5 dejaba la última fila vacía y
  // cada fila real se estiraba de más para "rellenar" ese hueco — visible
  // como un colchón de espacio en blanco debajo de la última semana.
  const weekCount = days.length / 7;

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

      for (const day of eachDayOfInterval({
        start: clampedStart,
        end: clampedEnd,
      })) {
        const key = dayKeyOf(day);
        const list = map.get(key);
        if (list) list.push(event);
        else map.set(key, [event]);
      }
    }

    return map;
  }, [events, gridStart, gridEnd]);

  return (
    // grid-rows-[auto_repeat(weekCount,minmax(0,1fr))]: la fila de
    // encabezado toma su alto natural y las N filas de semana REALES (5 o 6,
    // según el mes) se reparten todo el resto en partes iguales —
    // grid-auto-flow (por defecto "row") ya envuelve los días de a 7 por
    // fila sin necesitar un <div> contenedor por semana. border-l/t acá (no
    // en cada DayCell): cada celda solo dibuja su borde derecho/inferior —
    // sin este borde envolvente, la primera columna y la fila de encabezado
    // quedaban sin borde izquierdo/superior.
    <div
      className="grid h-full min-h-0 grid-cols-7 border-l border-t border-slate-400/20 dark:border-slate-600/20"
      style={{ gridTemplateRows: `auto repeat(${weekCount}, minmax(0, 1fr))` }}
    >
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
