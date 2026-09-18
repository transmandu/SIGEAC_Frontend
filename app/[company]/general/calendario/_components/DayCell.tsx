"use client";

import { useDroppable } from "@dnd-kit/core";
import { isSameDay } from "date-fns";
import { CalendarDays } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { EventPill } from "./EventPill";
import { LocalCalendarEvent } from "./types";

/** Más de esto y el resto se oculta detrás de "+N más" — evita que una celda con muchos eventos empuje el alto de toda la fila. */
const MAX_VISIBLE_PILLS = 3;

interface DayCellProps {
  day: Date;
  dayKey: string;
  events: LocalCalendarEvent[];
  monthStart: Date;
  canEdit: boolean;
  shortLabels: Record<string, string>;
  onSelectEvent: (event: LocalCalendarEvent) => void;
}

export function DayCell({ day, dayKey, events, monthStart, canEdit, shortLabels, onSelectEvent }: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });

  const isToday = isSameDay(day, new Date());
  const inCurrentMonth = day.getMonth() === monthStart.getMonth() && day.getFullYear() === monthStart.getFullYear();

  const visible = events.slice(0, MAX_VISIBLE_PILLS);
  const overflow = events.slice(MAX_VISIBLE_PILLS);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        // min-h-0 + overflow-hidden: sin esto, una celda con muchos eventos
        // crece más alto que las demás y CSS Grid deja de repartir las 6
        // filas de semana en partes iguales — el resto se maneja con el tope
        // de MAX_VISIBLE_PILLS + "+N más", no con scroll interno.
        "flex min-h-0 flex-col gap-0.5 overflow-hidden border-b border-r border-slate-400/20 p-1 dark:border-slate-600/20",
        !inCurrentMonth && "opacity-40",
        isOver && "bg-primary/10 ring-1 ring-inset ring-primary/40",
      )}
    >
      <span
        className={cn(
          "mb-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs",
          isToday && "bg-primary font-semibold text-primary-foreground",
        )}
      >
        {day.getDate()}
      </span>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5">
        {visible.map((event) => (
          <EventPill
            key={event.id}
            event={event}
            canEdit={canEdit}
            label={(event.sourceKey && shortLabels[event.sourceKey]) || (event.display === "marker" ? "Vencimiento" : event.title)}
            onClick={() => onSelectEvent(event)}
          />
        ))}

        {overflow.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full truncate rounded px-1 text-left text-[11px] font-medium text-muted-foreground hover:bg-accent"
              >
                +{overflow.length} más
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-1 p-2">
              <p className="mb-1 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Resto del día
              </p>
              {overflow.map((event) => (
                <EventPill
                  key={event.id}
                  event={event}
                  canEdit={canEdit}
                  label={(event.sourceKey && shortLabels[event.sourceKey]) || (event.display === "marker" ? "Vencimiento" : event.title)}
                  onClick={() => onSelectEvent(event)}
                />
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
