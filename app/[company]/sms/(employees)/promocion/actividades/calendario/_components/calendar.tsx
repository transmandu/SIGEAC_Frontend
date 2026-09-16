"use client";
import { useUpdateCalendarSMSActivity } from "@/actions/sms/sms_actividades/actions";
import CreateSMSActivityDialog from "@/components/dialogs/aerolinea/sms/CreateSMSActivityDialog";
import { Button } from "@/components/ui/button";
import {
  calendarMomentToDate,
  calendarMomentToString,
  calendarMomentToTime,
  toCalendarMoment,
  type CalendarMoment,
  calendarTimeZone,
} from "@/lib/calendar-temporal";
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
import { ClockIcon, Hammer, NotebookIcon, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

interface SMSActivities {
  id: number;
  activity_number: string;
  title: string;
  start: string;
  end: string;
  description: string;
  calendarId: string;
  status: "ABIERTO" | "CERRADO" | "PENDIENTE"; // Asegúrate de que esta propiedad existe
}

/** El mismo evento ya traducido a lo que schedule-x pide desde la 3. */
type scheduleXActivityEvent = Omit<SMSActivities, "start" | "end"> & {
  start: CalendarMoment;
  end: CalendarMoment;
};

type CalendarProps = {
  events: SMSActivities[];
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
  const { selectedCompany } = useCompanyStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const eventsServiceRef = useRef(createEventsServicePlugin());
  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const resizePlugin = useMemo(() => createResizePlugin(30), []);

  // schedule-x 3 dejó de aceptar texto en start/end.
  const calendarEvents = useMemo<scheduleXActivityEvent[]>(
    () =>
      events.map((event) => ({
        ...event,
        start: toCalendarMoment(event.start),
        end: toCalendarMoment(event.end),
      })),
    [events],
  );

  const { updateCalendarSMSActivity } = useUpdateCalendarSMSActivity();

  // ✅ Esta llamada es correcta, fuera de useMemo
  const calendar = useNextCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    calendars: eventStatus,
    events: calendarEvents,
    // Misma zona en la que se arman los eventos: con el default (UTC)
    // schedule-x los corre al offset local.
    timezone: calendarTimeZone(),
    locale: "es-ES",
    defaultView: "month",
    isResponsive: true,
    plugins: [dragAndDrop, eventsServiceRef.current, eventModal, resizePlugin],
    dayBoundaries: { start: "06:00", end: "18:00" },
    callbacks: {
      onDoubleClickDate: (date) => {
        setSelectedDate(`${date.toString()} 0:00`);
        setIsDialogOpen(true);
      },
      onDoubleClickDateTime: (dateTime) => {
        setSelectedDate(calendarMomentToString(dateTime));
        setIsDialogOpen(true);
      },
      onEventUpdate: async (event) => {
        try {
          await updateCalendarSMSActivity.mutateAsync({
            company: selectedCompany!.slug,
            id: event.id as string,
            data: {
              // El spread traería los Temporal crudos: start y end vuelven a
              // texto para el backend.
              ...event,
              start: calendarMomentToString(event.start),
              end: calendarMomentToString(event.end),
              start_date: calendarMomentToDate(event.start),
              end_date: calendarMomentToDate(event.end),
              start_time: calendarMomentToTime(event.start),
              end_time: calendarMomentToTime(event.end),
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
        calendarEvent: scheduleXActivityEvent;
        close: () => void;
      }) => {
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
                <Button variant="outline">
                  <Link
                    href={`/${selectedCompany?.slug}/planificacion/ordenes_trabajo/nueva_orden_trabajo?eventId=${calendarEvent.id}`}
                    className="flex items-center"
                  ></Link>
                </Button>
              </div>
            )}

            {calendarEvent?.activity_number && (
              <div className="mt-6 flex justify-center">
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={`/${selectedCompany?.slug}/sms/promocion/actividades/${calendarEvent.activity_number}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Hammer className="w-4 h-4" />
                    Ver actividad
                  </Link>
                </Button>
              </div>
            )}
          </div>
        );
      },
    }),
    [selectedCompany?.slug]
  );

  // ✅ Refrescar eventos en el servicio solo cuando cambian
  useEffect(() => {
    if (calendarEvents && eventsServiceRef.current) {
      eventsServiceRef.current.set(calendarEvents);
    }
  }, [calendarEvents]);

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
