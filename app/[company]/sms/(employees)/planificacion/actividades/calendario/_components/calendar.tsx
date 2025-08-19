"use client";
import { useUpdateCalendarSMSActivity } from "@/actions/sms/sms_actividades/actions";
import CreateSMSActivityDialog from "@/components/dialogs/aerolinea/sms/CreateSMSActivityDialog";
// import { useUpdatePlanificationEvent } from "@/actions/mantenimiento/planificacion/eventos/actions";
// import CreatePlanificationEventDialog from "@/components/dialogs/mantenimiento/planificacion/calendario/CreatePlanificationEventDialog";
import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PlanificationEvent } from "@/types";
// import { PlanificationEvent } from "@/types";
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
import { ClockIcon, Hammer, NotebookIcon, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

interface SMSActivities {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string;
}

type CalendarProps = {
  events: SMSActivities[];
  theme?: "dark" | "light";
};

const priorityCalendars = {
  HIGH: {
    colorName: "HIGH",
    lightColors: {
      main: "#ef4444", // rojo fuerte
      container: "#fee2e2",
      onContainer: "#7f1d1d",
    },
    darkColors: {
      main: "#fca5a5",
      container: "#7f1d1d",
      onContainer: "#fecaca",
    },
  },
  MEDIUM: {
    colorName: "MEDIUM",
    lightColors: {
      main: "#f59e0b", // naranja
      container: "#fef3c7",
      onContainer: "#78350f",
    },
    darkColors: {
      main: "#fde68a",
      container: "#78350f",
      onContainer: "#fef3c7",
    },
  },
  LOW: {
    colorName: "LOW",
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
  const { selectedCompany } = useCompanyStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const eventsServiceRef = useRef(createEventsServicePlugin());
  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const resizePlugin = useMemo(() => createResizePlugin(30), []);

  const { updateCalendarSMSActivity } = useUpdateCalendarSMSActivity();

  // ✅ Esta llamada es correcta, fuera de useMemo
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    calendars: priorityCalendars,
    events,
    locale: "es-ES",
    defaultView: "month",
    isResponsive: true,
    plugins: [dragAndDrop, eventsServiceRef.current, eventModal, resizePlugin],
    dayBoundaries: { start: "06:00", end: "18:00" },
    callbacks: {
      onDoubleClickDate: (date: string) => {
        // console.log("this is date fom onDoubleClickDate", date);
        setSelectedDate(`${date} 0:00`);
        setIsDialogOpen(true);
      },
      onDoubleClickDateTime: (dateTime: string) => {
        // console.log("this is date fom onDoubleClickDateTime", dateTime);
        setSelectedDate(dateTime);
        setIsDialogOpen(true);
      },
      onEventUpdate: async (event) => {
        // console.log("this is event I SWEAR", event);
        // console.log(typeof event.start);
        // console.log("start", event.start);
        // console.log("end", event.end);

        const start_time = event.start.split(" ")[1];
        const end_time = event.end.split(" ")[1];

        console.log("start_time", start_time);
        console.log("end_time", end_time);

        await updateCalendarSMSActivity.mutateAsync({
          company: selectedCompany!.slug,
          id: event.id as string,
          data: {
            ...event,
            start_date: new Date(event.start),
            end_date: new Date(event.end),
            start_time: start_time,
            end_time: end_time,
          },
        });
      },
    },
  });

  const customComponents = useMemo(
    () => ({
      eventModal: ({
        calendarEvent,
      }: {
        calendarEvent: SMSActivities;
        close: () => void;
      }) => {
        const startDate = new Date(calendarEvent.start);
        const endDate = new Date(calendarEvent.end);

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

              {calendarEvent.title && (
                <div className="flex items-start text-sm">
                  <NotebookIcon className="w-4 h-4 mr-2 mt-0.5" />
                  <span>{calendarEvent.title}</span>
                </div>
              )}
            </div>
            {calendarEvent && calendarEvent.description ? (
              <div className="flex justify-center">
                <span>{calendarEvent.description}</span>
              </div>
            ) : (
              <div className="flex justify-center">
                {/* <Button variant="outline">
                  <Link
                    href={`/${selectedCompany?.slug}/planificacion/ordenes_trabajo/nueva_orden_trabajo?eventId=${calendarEvent.id}`}
                    className="flex items-center"
                  >
                    Generar OT <Hammer className="ml-2" />
                  </Link>
                </Button> */}
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
      <CreateSMSActivityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
};
