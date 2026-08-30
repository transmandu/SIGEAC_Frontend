"use client";
import { useUpdateCourseCalendar } from "@/actions/general/cursos/actions";
import CreateSMSActivityDialog from "@/components/dialogs/aerolinea/sms/CreateSMSActivityDialog";
import CreateCourseCalendarDialog from "@/components/dialogs/general/CreateCourseCalendarDialog";
import { Button } from "@/components/ui/button";
import { dateToZonedDateTime, temporalToDate } from "@/lib/scheduleXTemporal";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
  type CalendarEvent as ScheduleXEvent,
} from "@schedule-x/calendar";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createResizePlugin } from "@schedule-x/resize";
import "@schedule-x/theme-default/dist/index.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClockIcon,
  GraduationCap,
  Hammer,
  NotebookIcon,
  PencilLine,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

interface courseEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string;
  course_type: string;
  calendarId: string;
}

type CalendarProps = {
  events: courseEvent[];
  theme?: "dark" | "light";
};

const eventStatus = {
  // GREEN
  OPEN: {
    colorName: "abierto",
    lightColors: {
      main: "#2ADE99", // rojo fuerte
      container: "#B3FFCC",
      onContainer: "#000",
    },
    darkColors: {
      main: "#2ADE99", // rojo fuerte
      container: "#B3FFCC",
      onContainer: "#000",
    },
  },
  // RED
  CLOSED: {
    colorName: "cerrado",
    lightColors: {
      main: "#FF1A1A", //
      container: "#FFA8A8",
      onContainer: "#000",
    },
    darkColors: {
      main: "#FF1A1A",
      container: "#FA9B9B",
      onContainer: "#000",
    },
  },
};

// schedule-x v3 pide Temporal en vez de strings para start/end de cada evento.
function toScheduleXEvents(events: courseEvent[]): ScheduleXEvent[] {
  return events.map((event) => ({
    ...event,
    start: dateToZonedDateTime(new Date(event.start)),
    end: dateToZonedDateTime(new Date(event.end)),
  }));
}

export const Calendar = ({ events, theme = "light" }: CalendarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const { selectedCompany } = useCompanyStore();
  const eventsServiceRef = useRef(createEventsServicePlugin());
  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const resizePlugin = useMemo(() => createResizePlugin(30), []);
  const scheduleXEvents = useMemo(() => toScheduleXEvents(events), [events]);

  const { updateCourseCalendar } = useUpdateCourseCalendar();
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    calendars: eventStatus,
    events: scheduleXEvents,
    locale: "es-ES",
    defaultView: "month-grid",
    isResponsive: true,
    plugins: [dragAndDrop, eventsServiceRef.current, eventModal, resizePlugin],
    dayBoundaries: { start: "06:00", end: "18:00" },
    callbacks: {
      onDoubleClickDate: (date) => {
        setSelectedDate(`${date.toString()} 0:00`);
        setIsDialogOpen(true);
      },
      onDoubleClickDateTime: (dateTime) => {
        setSelectedDate(format(temporalToDate(dateTime), "yyyy-MM-dd HH:mm"));
        setIsDialogOpen(true);
      },
      onEventUpdate: async (event) => {
        const startDate = temporalToDate(event.start);
        const endDate = temporalToDate(event.end);

        try {
          await updateCourseCalendar.mutateAsync({
            id: event.id as string,
            data: {
              ...event,
              start_date: startDate,
              end_date: endDate,
              start_time: format(startDate, "HH:mm"),
              end_time: format(endDate, "HH:mm"),
              status: event.calendarId,
            },
          });
        } catch (error) {
          console.error("Error al actualizar el evento:", error);
        }
      },
    },
  });

  const customComponents = useMemo(
    () => ({
      eventModal: ({
        calendarEvent,
      }: {
        calendarEvent: ScheduleXEvent;
        close: () => void;
      }) => {
        const startDate = temporalToDate(calendarEvent.start);
        const endDate = temporalToDate(calendarEvent.end);

        return (
          <div className="text-foreground p-6 rounded-lg shadow-xl max-w-md w-full border border-border">
            <div className="flex gap-2 items-center mb-4">
              <PencilLine />
              <h3 className="text-xl font-semibold">{calendarEvent?.title}</h3>
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
              {calendarEvent.title && (
                <div className="flex items-start text-sm">
                  <NotebookIcon className="w-4 h-4 mr-2 mt-0.5" />
                  <span>{calendarEvent.title}</span>
                </div>
              )}
              {calendarEvent.calendarId && (
                <div className="flex items-start text-sm">
                  <RefreshCw className="w-4 h-4 mr-2 mt-0.5" />
                  <span>{calendarEvent.calendarId}</span>
                </div>
              )}
              {calendarEvent.course_type && (
                <div className="flex items-start text-sm">
                  <GraduationCap className="w-4 h-4 mr-2 mt-0.5" />
                  <span>{calendarEvent.course_type}</span>
                </div>
              )}
            </div>
            {calendarEvent.description ? (
              <div className="flex justify-center">
                <span>{calendarEvent.description}</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button variant="outline"></Button>
              </div>
            )}
          </div>
        );
      },
    }),
    [],
  );

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
    <div className="w-full h-screen p-4">
      <div data-tour="calendario-grid">
        <ScheduleXCalendar
          calendarApp={calendar}
          customComponents={customComponents}
        />
      </div>
      <CreateCourseCalendarDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
};
