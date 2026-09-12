"use client";
import {
  calendarMomentToDate,
  calendarTimeZone,
  toCalendarMoment,
  type CalendarMoment,
} from "@/lib/calendar-temporal";
import { WorkOrderTaskEvent } from "@/types";
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
  type CalendarEvent as ScheduleXEvent,
} from "@schedule-x/calendar";
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClockIcon, NotebookIcon, PencilLine } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

type CalendarProps = {
  events: WorkOrderTaskEvent[];
  theme?: "dark" | "light";
};

const priorityCalendars = {
  HIGH: {
    colorName: 'HIGH',
    lightColors: {
      main: '#ef4444',       // rojo fuerte
      container: '#fee2e2',
      onContainer: '#7f1d1d',
    },
    darkColors: {
      main: '#fca5a5',
      container: '#7f1d1d',
      onContainer: '#fecaca',
    },
  },
  MEDIUM: {
    colorName: 'MEDIUM',
    lightColors: {
      main: '#f59e0b',       // naranja
      container: '#fef3c7',
      onContainer: '#78350f',
    },
    darkColors: {
      main: '#fde68a',
      container: '#78350f',
      onContainer: '#fef3c7',
    },
  },
  LOW: {
    colorName: 'LOW',
    lightColors: {
      main: '#10b981',       // verde
      container: '#d1fae5',
      onContainer: '#064e3b',
    },
    darkColors: {
      main: '#6ee7b7',
      container: '#064e3b',
      onContainer: '#d1fae5',
    },
  },
};


/** El mismo evento ya traducido a lo que schedule-x pide desde la 3. */
type scheduleXTaskEvent = Omit<WorkOrderTaskEvent, "start" | "end"> & {
  start: CalendarMoment;
  end: CalendarMoment;
};

// schedule-x v3 pide Temporal en vez de strings para start/end de cada evento.
function toScheduleXEvents(events: WorkOrderTaskEvent[]): scheduleXTaskEvent[] {
  return events.map((event) => ({
    ...event,
    start: toCalendarMoment(event.start),
    end: toCalendarMoment(event.end),
  }));
}

export const Calendar = ({ events, theme = "light" }: CalendarProps) => {
  const eventsServiceRef = useRef(createEventsServicePlugin());
  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const scheduleXEvents = useMemo(() => toScheduleXEvents(events), [events]);

  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    calendars: priorityCalendars,
    events: scheduleXEvents,
    // Misma zona en la que se arman los eventos: con el default (UTC)
    // schedule-x los corre al offset local.
    timezone: calendarTimeZone(),
    locale: "es-ES",
    defaultView: "month-grid",
    isResponsive: true,
    plugins: [eventsServiceRef.current, eventModal],
    dayBoundaries: { start: '06:00', end: '18:00' },
  });

  const customComponents = useMemo(() => ({
    eventModal: ({ calendarEvent, close }: { calendarEvent: scheduleXTaskEvent; close: () => void }) => {
      const startDate = calendarMomentToDate(calendarEvent.start);
      const endDate = calendarMomentToDate(calendarEvent.end);
      return (
        <div className="text-foreground p-6 rounded-lg shadow-xl max-w-md w-full border border-border">
          <div className="flex gap-2 items-center mb-4">
            <PencilLine />
            <h3 className="text-xl font-semibold">{calendarEvent.title}</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {`${format(startDate, "d 'de' MMMM 'de' yyyy, H:mm", { locale: es })} – ${format(endDate, "d 'de' MMMM 'de' yyyy, H:mm", { locale: es })}`}
                </span>
              </div>
            </div>

            {calendarEvent.description && (
              <div className="flex items-start text-sm">
                <NotebookIcon className="w-4 h-4 mr-2 mt-0.5" />
                <span>{calendarEvent.description}</span>
              </div>
            )}
          </div>
        </div>
      );
    },
  }), []);

  // ✅ Refrescar eventos en el servicio solo cuando cambian
  useEffect(() => {
    if (scheduleXEvents && eventsServiceRef.current) {
      eventsServiceRef.current.set(scheduleXEvents);
    }
  }, [scheduleXEvents]);

  // ✅ Actualizar tema dinámicamente
  useEffect(() => {
    calendar?.setTheme(theme);
  }, [theme, calendar]);

  return (
    <div className="flex justify-center">
      <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
    </div>
  );
};
