"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createViewMonthGrid,
  type CalendarEvent as ScheduleXEvent,
} from "@schedule-x/calendar";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import { createResizePlugin } from "@schedule-x/resize";
import "@schedule-x/theme-shadcn/dist/index.css";
import { endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, CalendarX2, ListFilter, NotebookText, PencilLine } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCalendarEvents } from "@/hooks/general/calendario/useGetCalendarEvents";
import { useGetCalendarEventSources } from "@/hooks/general/calendario/useGetCalendarEventSources";
import { useUpdateCalendarEvent, useDeleteCalendarEvent } from "@/actions/general/calendario/actions";
import { dateToPlainDateLocal, dateToZonedDateTime, temporalToDate } from "@/lib/scheduleXTemporal";
import { cn } from "@/lib/utils";
import { CreateEventDialog } from "./CreateEventDialog";
import { LocalCalendarEvent } from "./types";

const MANUAL_SOURCE_KEY = "manual";

// Schedule-X exige que el id sea un identificador CSS válido (lo usa con
// document.querySelector) — los ids del backend traen ":" como separador
// (ej. "employee_birthday:39:2026"), que ahí no es válido. Se sanea UNA vez
// acá y ese id saneado es el que se usa en todo el resto del componente.
const toDomSafeId = (id: string) => id.replace(/:/g, "-");
const MANUAL_ID_PREFIX = "manual-";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Un evento all_day es un DÍA de calendario, no un instante — leer su fecha
 * a través de cualquier huso horario (incluyendo el del navegador) puede
 * correrla un día. Se toman los componentes Y-M-D directos del string ISO
 * que manda el backend y se arma un Date local con ESOS mismos componentes,
 * sin reinterpretar nada.
 */
function parseIsoDateLocal(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Fecha tal como la tiene que guardar el backend. Para un evento con hora, el
 * instante real (ISO/UTC) es lo correcto. Para uno de TODO EL DÍA no: su Date
 * es medianoche LOCAL, y toISOString() lo convierte a UTC — en Caracas
 * (UTC-4) eso da las 04:00 del mismo día al ir, pero el backend lo devuelve
 * como día calendario y cualquier reinterpretación por huso puede correrlo.
 * Se manda la pared Y-M-D sin huso, que es lo único que significa un all_day.
 */
function toBackendDate(date: Date, allDay: boolean): string {
  if (!allDay) return date.toISOString();

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 00:00:00`;
}

/** Marca los eventos "de fondo" (ej. vencimiento de consumible): sin bloque de color, mismo lenguaje que el resto del calendario. */
const MARKER_CALENDAR_ID = "marker";

/**
 * Cualquier evento "real" (no marker) pinta su propio color por completo vía
 * _customContent — sin esto, Schedule-X sigue de fondo pintando el color por
 * defecto de SU tema (azul) en el contenedor exterior, que se ve por detrás
 * o al lado del color propio y los mezcla. container:transparent en los dos
 * modos deja que el color real sea el único que se vea.
 */
const CUSTOM_CALENDAR_ID = "custom";

/** Para lo que no tiene un color propio asignado (nunca para "marker") — un morado neutro, no el azul de Schedule-X. */
const DEFAULT_EVENT_COLOR = "#8b5cf6";

/**
 * La grilla del mes es para ubicar de un vistazo QUÉ TIPO de cosa hay ese
 * día, no el detalle — el detalle real (de quién es, cuál consumible, etc.)
 * vive en el clic (eventModal, sigue usando el título completo) y en la
 * lista lateral. Por eso acá se pinta una etiqueta corta y genérica, nunca
 * el título completo que arma el backend.
 */
const GRID_SHORT_LABEL: Record<string, string> = {
  employee_birthday: "🎂 Cumpleaños",
  sms_course: "Curso SMS",
  maintenance_control: "Vencimiento Mtto.",
  work_order: "Orden de Trabajo",
};

/** Punto de color + etiqueta corta, para "marker" (siempre "Vencimiento", nunca el detalle puntual). */
function monthGridDot(color: string, label: string): string {
  const safeColor = color.replace(/"/g, "");
  const dot = `<span style="width:8px;height:8px;border-radius:9999px;background:${safeColor};flex-shrink:0;"></span>`;

  return (
    `<div style="display:flex;align-items:center;gap:4px;padding:1px 2px;overflow:hidden;">`
    + dot
    + `<span style="font-size:11px;line-height:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(label)}</span>`
    + `</div>`
  );
}

/**
 * El usuario elige UN color (por tipo de evento); de ahí se derivan solos el
 * fondo (tinte translúcido del mismo color, no un color aparte) y el borde —
 * así la letra, el punto de la lista lateral y la tarjeta del calendario
 * siempre leen como "el mismo color", nunca uno pisando al otro.
 */
function hexToRgba(hex: string, alpha: number): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Tarjeta coloreada, para _customContent.monthGrid. width/height/box-sizing
 * explícitos: sin esto quedaba más chica que un evento normal de Schedule-X,
 * porque un <div> sin ancho propio solo ocupa lo que su texto necesita —
 * acá debe llenar TODO el espacio que Schedule-X ya le reservó al evento.
 */
function coloredEventCard(color: string, label: string): string {
  const safeColor = color.replace(/"/g, "");
  const background = hexToRgba(safeColor, 0.16) ?? "hsl(var(--muted))";

  return (
    `<div style="width:100%;height:100%;box-sizing:border-box;background:${background};`
    + `border-left:3px solid ${safeColor};color:${safeColor};font-weight:600;border-radius:4px;`
    + `padding:2px 6px;font-size:12px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;`
    + `white-space:nowrap;">${escapeHtml(label)}</div>`
  );
}

function toScheduleXEvents(events: LocalCalendarEvent[]): ScheduleXEvent[] {
  return events.map((event) => {
    // all_day usa los componentes LOCALES del Date (dateToPlainDateLocal), no
    // un huso horario: event.start/end ya se armaron con esos mismos
    // componentes en parseIsoDateLocal, así que es un viaje de ida y vuelta
    // exacto. Los eventos con hora sí necesitan el huso real (Caracas).
    const start = event.allDay ? dateToPlainDateLocal(event.start) : dateToZonedDateTime(event.start);
    const end = event.allDay ? dateToPlainDateLocal(event.end) : dateToZonedDateTime(event.end);

    const scheduleXEvent: ScheduleXEvent = {
      id: event.id,
      // El título completo se conserva siempre acá: lo usa el eventModal al
      // hacer clic. Solo la grilla del mes (_customContent.monthGrid) recibe
      // la versión corta/sin texto.
      title: event.title,
      description: event.description,
      start,
      end,
    };

    if (event.display === "marker") {
      // "Vencimiento", no el consumible puntual — ese detalle vive en la
      // lista lateral y al hacer clic. calendarId lo pinta sutil (ver
      // `calendars` en useNextCalendarApp) para que no ocupe una barra
      // completa como un evento real.
      scheduleXEvent._customContent = { monthGrid: monthGridDot(event.color ?? "currentColor", "Vencimiento") };
      scheduleXEvent.calendarId = MARKER_CALENDAR_ID;
    } else if (event.sourceKey && GRID_SHORT_LABEL[event.sourceKey]) {
      // Etiqueta genérica del tipo ("🎂 Cumpleaños"), no el detalle puntual —
      // ese vive en la lista lateral y al hacer clic. calendarId con
      // container transparente: si no, el azul de tema de Schedule-X se ve
      // detrás del color propio y los mezcla.
      scheduleXEvent._customContent = {
        monthGrid: coloredEventCard(event.color ?? DEFAULT_EVENT_COLOR, GRID_SHORT_LABEL[event.sourceKey]),
      };
      scheduleXEvent.calendarId = CUSTOM_CALENDAR_ID;
    } else if (!event.sourceKey) {
      // Evento manual: su propio color si tiene tipo asignado, si no el
      // morado por defecto — nunca el azul de tema de Schedule-X.
      scheduleXEvent._customContent = { monthGrid: coloredEventCard(event.color ?? DEFAULT_EVENT_COLOR, event.title) };
      scheduleXEvent.calendarId = CUSTOM_CALENDAR_ID;
    }

    return scheduleXEvent;
  });
}

function formatSidebarTime(event: LocalCalendarEvent): string {
  return event.allDay
    ? `${format(event.start, "d MMM", { locale: es })} · Todo el día`
    : format(event.start, "d MMM, H:mm", { locale: es });
}

function formatModalDateRange(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    return isSameDay(start, end)
      ? `${format(start, "d 'de' MMMM, yyyy", { locale: es })} — Todo el día`
      : `${format(start, "d MMM", { locale: es })} – ${format(end, "d 'de' MMMM, yyyy", { locale: es })} — Todo el día`;
  }

  return `${format(start, "d 'de' MMMM, yyyy — H:mm", { locale: es })} – ${format(end, "H:mm", { locale: es })}`;
}

export function EventCalendar() {
  const { resolvedTheme } = useTheme();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const [visibleRange, setVisibleRange] = useState<{ start: Date; end: Date }>(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalCalendarEvent | undefined>();
  const [hiddenSourceKeys, setHiddenSourceKeys] = useState<Set<string>>(new Set());

  const { data: eventDtos = [] } = useGetCalendarEvents(
    companySlug,
    visibleRange.start.toISOString(),
    visibleRange.end.toISOString(),
  );
  const { data: sources = [] } = useGetCalendarEventSources(companySlug);
  const { updateCalendarEvent } = useUpdateCalendarEvent();
  const { deleteCalendarEvent } = useDeleteCalendarEvent();

  const events = useMemo<LocalCalendarEvent[]>(
    () =>
      eventDtos.map((dto) => ({
        id: toDomSafeId(dto.id),
        title: dto.title,
        description: dto.description ?? undefined,
        start: dto.all_day ? parseIsoDateLocal(dto.start) : new Date(dto.start),
        end: dto.all_day ? parseIsoDateLocal(dto.end) : new Date(dto.end),
        sourceKey: dto.source_key,
        editable: dto.editable,
        display: dto.display,
        color: dto.color,
        url: dto.url,
        allDay: dto.all_day,
      })),
    [eventDtos],
  );

  // Etiqueta legible por filtro: las fuentes de sistema traen la suya propia;
  // los eventos manuales (source_key null) no tienen fuente que preguntar.
  const sourceLabels = useMemo(() => {
    const labels: Record<string, string> = { [MANUAL_SOURCE_KEY]: "Eventos manuales" };
    for (const source of sources) labels[source.key] = source.label;
    return labels;
  }, [sources]);

  const availableFilterKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const event of events) keys.add(event.sourceKey ?? MANUAL_SOURCE_KEY);
    return Array.from(keys);
  }, [events]);

  const toggleFilter = (key: string) => {
    setHiddenSourceKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleEvents = useMemo(
    () => events.filter((event) => !hiddenSourceKeys.has(event.sourceKey ?? MANUAL_SOURCE_KEY)),
    [events, hiddenSourceKeys],
  );

  const eventsServiceRef = useRef(createEventsServicePlugin());

  // `useNextCalendarApp` construye el calendario UNA sola vez (su useEffect
  // tiene deps []), así que todo lo que capturen sus `callbacks` queda
  // congelado en el primer render — cuando `visibleEvents` todavía es [] y
  // `companySlug` puede ser undefined. Sin este ref, onEventUpdate nunca
  // encontraba el evento arrastrado y el cambio se perdía en silencio.
  const latest = useRef({ visibleEvents, companySlug, updateCalendarEvent });
  latest.current = { visibleEvents, companySlug, updateCalendarEvent };

  // Mismo motivo, para los customComponents: el efecto que monta el
  // calendario en @schedule-x/react depende de la IDENTIDAD del objeto
  // `customComponents`, y su cleanup llama a calendarApp.destroy(). Si ese
  // objeto se rehace cuando llegan los eventos, el calendario entero se
  // destruye y se vuelve a montar: se pierde el mes al que el usuario había
  // navegado y se re-dispara onRangeUpdate. Por eso los customComponents se
  // memoizan con deps estables y leen lo vivo desde este ref (se rellena
  // más abajo, cuando `currentMonth` ya existe).
  const renderData = useRef<{
    events: LocalCalendarEvent[];
    sourceLabels: Record<string, string>;
    currentMonth: { start: Date; end: Date };
  }>({ events, sourceLabels, currentMonth: { start: visibleRange.start, end: visibleRange.end } });

  const eventModal = useMemo(() => createEventModalPlugin(), []);
  const dragAndDrop = useMemo(() => createDragAndDropPlugin(), []);
  const resizePlugin = useMemo(() => createResizePlugin(15), []);
  const scheduleXEvents = useMemo(() => toScheduleXEvents(visibleEvents), [visibleEvents]);

  const calendar = useNextCalendarApp({
    // Un solo view registrado: sin selector de vistas, siempre mes.
    views: [createViewMonthGrid()],
    events: scheduleXEvents,
    locale: "es-ES",
    defaultView: "month-grid",
    isResponsive: true,
    // "marker" (vencimientos de consumibles) va sin fondo de color: solo el
    // punto que ya dibuja _customContent, para que no ocupe una barra
    // completa como un evento real.
    calendars: {
      [MARKER_CALENDAR_ID]: {
        colorName: MARKER_CALENDAR_ID,
        // Sutil pero visible: un tinte leve, no transparente del todo —
        // "fantasma" total se leía como si no hubiera nada ahí.
        lightColors: { main: "#71717a", container: "rgba(113,113,122,0.14)", onContainer: "#52525b" },
        darkColors: { main: "#a1a1aa", container: "rgba(161,161,170,0.2)", onContainer: "#d4d4d8" },
      },
      // Todo evento "real" pinta su color entero a mano vía _customContent —
      // las TRES claves en transparent, no solo container: Schedule-X usa
      // "main" para su propio acento/borde por fuera de _customContent
      // (una barra del color del tema, fija, sin importar el color real de
      // cada evento) — si queda cualquiera de las tres con color propio,
      // ese resto del tema se sigue viendo al lado del color correcto.
      [CUSTOM_CALENDAR_ID]: {
        colorName: CUSTOM_CALENDAR_ID,
        lightColors: { main: "transparent", container: "transparent", onContainer: "transparent" },
        darkColors: { main: "transparent", container: "transparent", onContainer: "transparent" },
      },
    },
    plugins: [dragAndDrop, eventsServiceRef.current, eventModal, resizePlugin],
    callbacks: {
      onRangeUpdate: (range) => {
        const start = temporalToDate(range.start);
        const end = temporalToDate(range.end);
        // Schedule-X puede disparar esto más de una vez con el mismo rango
        // (montaje + reflow); actualizar el estado igual dispara un fetch
        // nuevo (query key cambia de referencia) aunque el rango sea idéntico.
        setVisibleRange((prev) =>
          prev.start.getTime() === start.getTime() && prev.end.getTime() === end.getTime() ? prev : { start, end },
        );
      },
      onEventUpdate: (event) => {
        const { visibleEvents: currentEvents, companySlug: currentCompany, updateCalendarEvent: update } = latest.current;
        const source = currentEvents.find((e) => e.id === event.id);
        // Solo los eventos manuales se pueden arrastrar/redimensionar; los
        // automáticos son de solo lectura (los calcula su propio módulo). Al
        // soltar uno de esos, Schedule-X ya lo movió en su estado interno: se
        // repinta la lista real para devolverlo a su sitio en el acto, en vez
        // de dejarlo en una fecha falsa hasta el próximo refetch.
        if (!source?.editable || !currentCompany) {
          eventsServiceRef.current.set(toScheduleXEvents(currentEvents));

          return;
        }

        const numericId = Number(String(event.id).replace(MANUAL_ID_PREFIX, ""));
        const isAllDay = source.allDay ?? false;
        update.mutate({
          id: numericId,
          company: currentCompany,
          data: {
            title: source.title,
            description: source.description,
            start_at: toBackendDate(temporalToDate(event.start), isAllDay),
            end_at: toBackendDate(temporalToDate(event.end), isAllDay),
            all_day: isAllDay,
          },
        });
      },
    },
  });

  // El calendario solo lee `events` al montarse; los cambios posteriores
  // (editar/eliminar/arrastrar/refetch) hay que empujarlos por el plugin.
  useEffect(() => {
    eventsServiceRef.current.set(scheduleXEvents);
  }, [scheduleXEvents]);

  useEffect(() => {
    calendar?.setTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme, calendar]);

  // Estable a propósito (deps []): la usa el eventModal, que vive dentro del
  // `customComponents` memoizado — lee los eventos del ref, no del closure.
  const openEditDialog = useCallback((id: string) => {
    const source = renderData.current.events.find((e) => e.id === id);
    if (!source?.editable) return;
    setEditingEvent(source);
    setDialogOpen(true);
  }, []);

  const handleSave = (event: LocalCalendarEvent) => {
    if (!companySlug) return;
    const numericId = Number(event.id.replace(MANUAL_ID_PREFIX, ""));
    updateCalendarEvent.mutate({
      id: numericId,
      company: companySlug,
      data: {
        title: event.title,
        description: event.description,
        start_at: toBackendDate(event.start, event.allDay ?? false),
        end_at: toBackendDate(event.end, event.allDay ?? false),
        all_day: event.allDay ?? false,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!companySlug) return;
    const numericId = Number(id.replace(MANUAL_ID_PREFIX, ""));
    deleteCalendarEvent.mutate({ id: numericId, company: companySlug });
  };

  // El month-grid de Schedule-X rellena la grilla con días del mes anterior
  // y siguiente — `visibleRange` (de onRangeUpdate) es ESE rango completo,
  // no el mes que el usuario está viendo (podía empezar en julio estando en
  // agosto). El punto medio del rango sí cae siempre dentro del mes real.
  const currentMonth = useMemo(() => {
    const midpoint = new Date((visibleRange.start.getTime() + visibleRange.end.getTime()) / 2);
    return { start: startOfMonth(midpoint), end: endOfMonth(midpoint) };
  }, [visibleRange]);

  renderData.current = { events, sourceLabels, currentMonth };

  const customComponents = useMemo(
    () => ({
      eventModal: ({ calendarEvent, close }: { calendarEvent: ScheduleXEvent; close: () => void }) => {
        const { events: currentEvents, sourceLabels: labels } = renderData.current;
        const source = currentEvents.find((e) => e.id === calendarEvent.id);
        const startDate = temporalToDate(calendarEvent.start);
        const endDate = temporalToDate(calendarEvent.end);

        return (
          <div className="w-full max-w-md rounded-xl border border-slate-400/50 bg-gradient-to-br from-background/95 to-background/90 p-5 shadow-xl backdrop-blur-md dark:border-slate-600/50">
            <h3 className="mb-1 text-base font-semibold leading-tight">{calendarEvent.title}</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {labels[source?.sourceKey ?? MANUAL_SOURCE_KEY] ?? "Evento"}
            </p>

            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 size-4 shrink-0" />
                <span>{formatModalDateRange(startDate, endDate, source?.allDay ?? false)}</span>
              </div>
              {calendarEvent.description && (
                <div className="flex items-start gap-2">
                  <NotebookText className="mt-0.5 size-4 shrink-0" />
                  <span>{calendarEvent.description}</span>
                </div>
              )}
            </div>

            {/* Sin acción disponible no se dibuja el botón: solo los eventos
                manuales se pueden editar. */}
            {source?.editable && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    openEditDialog(calendarEvent.id as string);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-400/60 px-3 py-1.5 text-sm font-medium transition-colors hover:border-blue-400/40 hover:text-primary dark:border-slate-600/60"
                >
                  <PencilLine className="size-4" />
                  Editar
                </button>
              </div>
            )}
          </div>
        );
      },
      // Sin esto, un día de julio o septiembre relleno en la grilla de
      // agosto se ve idéntico a uno de agosto — no hay forma de distinguirlos.
      monthGridDate: ({ date, jsDate }: { date: number; jsDate: Date }) => {
        const month = renderData.current.currentMonth;
        const isToday = isSameDay(jsDate, new Date());
        const inCurrentMonth = jsDate.getMonth() === month.start.getMonth()
          && jsDate.getFullYear() === month.start.getFullYear();

        return (
          <div className={cn("sx__month-grid-day__header-date", isToday && "sx__is-today", !inCurrentMonth && "opacity-40")}>
            {date}
          </div>
        );
      },
    }),
    // Deps [] a propósito: ver renderData arriba — cambiar la identidad de
    // este objeto desmonta y vuelve a montar el calendario entero.
    [openEditDialog],
  );

  // Se SOLAPA con el mes, no "empieza dentro del mes": un evento del 28 de
  // agosto al 3 de septiembre pertenece a los dos meses — filtrando por
  // `start` desaparecía por completo de la lista de septiembre.
  const eventsInView = useMemo(() => {
    return visibleEvents
      .filter((event) => event.start <= currentMonth.end && event.end >= currentMonth.start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [visibleEvents, currentMonth]);

  return (
    <div className="flex h-[720px] gap-4">
      <div
        className={cn(
          "min-w-0 flex-1",
          "[&_.sx-react-calendar-wrapper]:h-full [&_.sx-react-calendar-wrapper]:w-full",
          // !important: el CSS propio de Schedule-X (.is-shadcn .sx__range-heading)
          // tiene la misma especificidad y gana por orden de carga sin esto.
          "[&_.sx__range-heading]:!uppercase [&_.sx__range-heading]:!tracking-wide",
        )}
      >
        <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
      </div>

      <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-slate-400/40 bg-gradient-to-br from-background/60 to-background/30 p-4 backdrop-blur-sm dark:border-slate-600/40">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {format(currentMonth.start, "MMMM yyyy", { locale: es })}
          </h2>

          {/* Solo tiene sentido filtrar cuando hay más de una fuente a la vista. */}
          {availableFilterKeys.length > 1 && (
            <DropdownMenu>
              <TooltipProvider disableHoverableContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon" variant="ghost" className="size-7">
                        <ListFilter className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Filtrar por tipo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end">
                {availableFilterKeys.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={!hiddenSourceKeys.has(key)}
                    onCheckedChange={() => toggleFilter(key)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {sourceLabels[key] ?? key}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* content-visibility: el navegador se saltea el layout y el pintado
            de las filas fuera de vista, que es lo que aporta virtualizar, sin
            sumar una dependencia. contain-intrinsic-size reserva el alto
            aproximado de cada fila para que la barra de scroll no salte. */}
        <div className="flex-1 space-y-2 overflow-y-auto [&>*]:[content-visibility:auto] [&>*]:[contain-intrinsic-size:auto_58px]">
          {eventsInView.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <CalendarX2 className="size-6" />
              <p className="text-xs">Sin eventos este mes.</p>
            </div>
          ) : (
            <TooltipProvider disableHoverableContent delayDuration={200}>
              {eventsInView.map((event) =>
                event.editable ? (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => openEditDialog(event.id)}
                        className="w-full rounded-lg border border-slate-400/40 bg-background/60 p-2.5 text-left text-sm transition-colors hover:border-blue-400/40 dark:border-slate-600/40"
                      >
                        <p className="truncate font-medium leading-tight">{event.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatSidebarTime(event)}</p>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{event.title}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-full rounded-lg border border-transparent p-2.5 text-sm",
                          event.display === "marker" ? "opacity-70" : "bg-background/40",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: event.color ?? "hsl(var(--muted-foreground))" }}
                          />
                          <p className="truncate leading-tight">{event.title}</p>
                        </div>
                        <p className="mt-0.5 pl-3 text-xs text-muted-foreground">{formatSidebarTime(event)}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{event.title}</TooltipContent>
                  </Tooltip>
                ),
              )}
            </TooltipProvider>
          )}
        </div>
      </aside>

      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
