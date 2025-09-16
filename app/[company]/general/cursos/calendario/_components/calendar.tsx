"use client";
import { useUpdateCourseCalendar } from "@/actions/general/cursos/actions";
import CreateSMSActivityDialog from "@/components/dialogs/aerolinea/sms/CreateSMSActivityDialog";
import CreateCourseCalendarDialog from "@/components/dialogs/general/CreateCourseCalendarDialog";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
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
  ABIERTO: {
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
  CERRADO: {
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
  PENDIENTE: {
    colorName: "pendiente",
    lightColors: {
      main: "#10b981", // verde
      container: "#d1fae5",
      onContainer: "#064e3b",
    },
    darkColors: {
      main: "#6ee7b7",
      container: "#064e3b",
      onContainer: "#d1fae5",
    },
  },
};

export const Calendar = ({ events, theme = "light" }: CalendarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const { selectedCompany } = useCompanyStore();
  const eventsServiceRef = useRef(createEventsServicePlugin());
  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const resizePlugin = useMemo(() => createResizePlugin(30), []);

  const { updateCourseCalendar } = useUpdateCourseCalendar();
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    calendars: eventStatus,
    events,
    locale: "es-ES",
    defaultView: "month",
    isResponsive: true,
    plugins: [dragAndDrop, eventsServiceRef.current, eventModal, resizePlugin],
    dayBoundaries: { start: "06:00", end: "18:00" },
    callbacks: {
      onDoubleClickDate: (date: string) => {
        setSelectedDate(`${date} 0:00`);
        setIsDialogOpen(true);
      },
      onDoubleClickDateTime: (dateTime: string) => {
        setSelectedDate(dateTime);
        setIsDialogOpen(true);
      },
      onEventUpdate: async (event) => {
        const start_time = event.start.split(" ")[1];
        const end_time = event.end.split(" ")[1];

        try {
          await updateCourseCalendar.mutateAsync({
            id: event.id as string,
            data: {
              ...event,
              start_date: new Date(event.start),
              end_date: new Date(event.end),
              start_time: start_time,
              end_time: end_time,
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
        calendarEvent: courseEvent;
        close: () => void;
      }) => {
        const startDate = new Date(calendarEvent.start);
        const endDate = new Date(calendarEvent.end);

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
    []
  );

  // ✅ Refrescar eventos en el servicio solo cuando cambian
  useEffect(() => {
    if (events && eventsServiceRef.current) {
      eventsServiceRef.current.set(events);
    }
  }, [events]);

  // ✅ Actualizar tema dinámicamente
  useEffect(() => {
    calendar?.setTheme(theme);
  }, [theme, calendar]);

  return (
    <div className="w-full h-screen p-4">
      <ScheduleXCalendar
        calendarApp={calendar}
        customComponents={customComponents}
      />
      <CreateCourseCalendarDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
};
