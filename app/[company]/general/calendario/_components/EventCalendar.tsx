"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetCalendarEvents } from "@/hooks/general/calendario/useGetCalendarEvents";
import { useGetCalendarEventSources } from "@/hooks/general/calendario/useGetCalendarEventSources";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import {
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "@/actions/general/calendario/actions";
import { cn } from "@/lib/utils";
import { CreateEventDialog } from "./CreateEventDialog";
import { EventDetailDialog } from "./EventDetailDialog";
import { EventPill } from "./EventPill";
import { MonthGrid } from "./MonthGrid";
import { LocalCalendarEvent } from "./types";

const MANUAL_SOURCE_KEY = "manual";

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

function formatSidebarTime(event: LocalCalendarEvent): string {
  return event.allDay
    ? `${format(event.start, "d MMM", { locale: es })} · Todo el día`
    : format(event.start, "d MMM, H:mm", { locale: es });
}

export function EventCalendar() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;
  // Hoy solo SUPERUSER crea eventos manuales, así que es el único que puede
  // llegar a tener uno propio que arrastrar. El backend sigue siendo quien
  // decide evento por evento (`editable`): esto solo habilita el gesto.
  const canEdit = useIsSuperuser();

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<
    LocalCalendarEvent | undefined
  >();
  const [detailEvent, setDetailEvent] = useState<
    LocalCalendarEvent | undefined
  >();
  const [hiddenSourceKeys, setHiddenSourceKeys] = useState<Set<string>>(
    new Set(),
  );
  const [activeDrag, setActiveDrag] = useState<
    { kind: "move" | "resize"; event: LocalCalendarEvent } | undefined
  >();

  const visibleRange = useMemo(
    () => ({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    }),
    [currentMonth],
  );

  // Días de calendario, no instantes: el backend recorta por día y así dos
  // visitas al mismo mes comparten la misma entrada de caché — ver
  // useGetCalendarEvents.
  const { data: eventDtos = [] } = useGetCalendarEvents(
    companySlug,
    format(visibleRange.start, "yyyy-MM-dd"),
    format(visibleRange.end, "yyyy-MM-dd"),
  );
  // Las etiquetas cortas de la grilla salen de acá, así que hasta que llegue
  // no hay con qué rotular: se espera para no pintar primero el título largo
  // y cambiarlo a la etiqueta corta un instante después. `&& !!companySlug`
  // porque en react-query v5 una query deshabilitada queda en isPending para
  // siempre — sin eso, un slug ausente dejaría el calendario vacío sin fin.
  const { data: sources = [], isPending } =
    useGetCalendarEventSources(companySlug);
  const isLoadingSources = isPending && !!companySlug;
  const { updateCalendarEvent } = useUpdateCalendarEvent();
  const { deleteCalendarEvent } = useDeleteCalendarEvent();

  const events = useMemo<LocalCalendarEvent[]>(
    () =>
      eventDtos.map((dto) => ({
        // Id crudo del backend: la grilla nativa no necesita que sea un
        // selector CSS válido (eso era una exigencia de la librería
        // anterior), así que ya no hace falta sanear ":" ni anteponer un
        // prefijo para luego quitarlo al mutar.
        id: dto.id,
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
    const labels: Record<string, string> = {
      [MANUAL_SOURCE_KEY]: "Eventos manuales",
    };
    for (const source of sources) labels[source.key] = source.label;
    return labels;
  }, [sources]);

  // La versión corta, para la celda del mes — la declara cada provider.
  const shortLabels = useMemo<Record<string, string>>(() => {
    const labels: Record<string, string> = {};
    for (const source of sources) labels[source.key] = source.short_label;
    return labels;
  }, [sources]);

  /**
   * Los eventos de sistema traen la `url` de su módulo dueño ya construida,
   * pero SIN el prefijo de empresa: el slug es del cliente (cada quien está
   * parado en la suya), el backend no tiene por qué saberlo.
   */
  const openEventUrl = (url: string) => {
    if (!companySlug) return;
    router.push(`/${companySlug}${url}`);
  };

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
    () =>
      isLoadingSources
        ? []
        : events.filter(
            (event) =>
              !hiddenSourceKeys.has(event.sourceKey ?? MANUAL_SOURCE_KEY),
          ),
    [events, hiddenSourceKeys, isLoadingSources],
  );

  // Se SOLAPA con el mes, no "empieza dentro del mes": un evento del 28 de
  // agosto al 3 de septiembre pertenece a los dos meses — filtrando por
  // `start` desaparecía por completo de la lista de septiembre.
  const eventsInView = useMemo(() => {
    return visibleEvents
      .filter(
        (event) =>
          event.start <= visibleRange.end && event.end >= visibleRange.start,
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [visibleEvents, visibleRange]);

  const openEditDialog = (event: LocalCalendarEvent) => {
    if (!event.editable) return;
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleSave = (event: LocalCalendarEvent) => {
    if (!companySlug) return;
    updateCalendarEvent.mutate({
      id: event.id,
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
    deleteCalendarEvent.mutate({ id, company: companySlug });
  };

  const persistShift = (event: LocalCalendarEvent, start: Date, end: Date) => {
    if (!companySlug) return;
    updateCalendarEvent.mutate({
      id: event.id,
      company: companySlug,
      data: {
        title: event.title,
        description: event.description,
        start_at: toBackendDate(start, event.allDay ?? false),
        end_at: toBackendDate(end, event.allDay ?? false),
        all_day: event.allDay ?? false,
      },
    });
  };

  // distance:8 deja que dnd-kit distinga un clic (abre el detalle) de un
  // arrastre real — sin este umbral, cualquier mousedown+mouseup mínimo ya
  // cuenta como "se soltó en la misma celda" y el clic nunca llega a onClick.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      { kind: "move" | "resize"; event: LocalCalendarEvent } | undefined;
    if (data) setActiveDrag(data);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDrag(undefined);
    const data = e.active.data.current as
      { kind: "move" | "resize"; event: LocalCalendarEvent } | undefined;
    const targetDayKey = e.over?.id as string | undefined;
    if (!data || !targetDayKey || !companySlug) return;

    const { kind, event } = data;
    const [year, month, day] = targetDayKey.split("-").map(Number);
    const targetDay = new Date(year, month - 1, day);

    if (kind === "move") {
      const sourceDayKey = format(event.start, "yyyy-MM-dd");
      if (sourceDayKey === targetDayKey) return;

      const dayDelta = differenceInCalendarDays(targetDay, event.start);
      persistShift(
        event,
        addDays(event.start, dayDelta),
        addDays(event.end, dayDelta),
      );
      return;
    }

    // Resize a nivel de día: la grilla de mes no muestra hora, así que
    // "estirar" un evento solo tiene sentido como "cambiar el último día que
    // ocupa", nunca la hora de fin. Para un evento con hora se preserva su
    // H:m original y solo se reemplaza el Y-M-D.
    let newEnd = setMinutes(
      setHours(targetDay, getHours(event.end)),
      getMinutes(event.end),
    );
    if (newEnd < event.start) newEnd = event.end;

    persistShift(event, event.start, newEnd);
  };

  return (
    // h-200 fijo (800px) no se adapta al alto real del viewport, y no había
    // un piso mínimo: en laptop con DevTools abierto (o cualquier pantalla
    // con menos alto disponible) el cálculo podía colapsar y el aside se
    // veía superpuesto. 100dvh (no svh) sigue el viewport REALMENTE
    // renderizado, incluyendo los cambios que provoca abrir/cerrar DevTools;
    // 14rem es el alto ya ocupado arriba por PageHeader + título + padding
    // de esta página en particular (contenido fijo, no dinámico — si algún
    // día ese bloque cambia de alto, este número hay que ajustarlo junto).
    // min-h-[32rem] es un piso real: evita que el cálculo se aplaste en
    // ventanas muy bajas en vez de solo reducir el margen de error.
    <div className="flex h-[calc(100dvh-14rem)] min-h-128 flex-col gap-4 md:flex-row">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-400/40 bg-linear-to-br from-background/60 to-background/30 p-3 backdrop-blur-sm dark:border-slate-600/40">
          <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-400/30 pb-4 dark:border-slate-600/30">
            <h2 className="text-xl font-semibold capitalize tracking-tight">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-3">
              {/* Reemplaza al botón "Hoy": ese botón no tenía nada que decir
                  cuando ya se estaba viendo el mes actual (se veía muerto/sin
                  función) — la fecha de hoy es información útil siempre,
                  sin importar en qué mes esté parado el usuario. */}
              <span className="text-xs text-muted-foreground">
                {format(new Date(), "dd/MM/yyyy")}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() =>
                    setCurrentMonth((m) =>
                      startOfMonth(addDays(startOfMonth(m), -1)),
                    )
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() =>
                    setCurrentMonth((m) =>
                      startOfMonth(addDays(endOfMonth(m), 1)),
                    )
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* flex-1 + min-h-0 en vez de un alto calculado a mano (h-[calc(100%-Xrem)]):
              ese cálculo adivinaba cuánto medía el bloque de arriba y, si no coincidía
              exacto, dejaba un hueco vacío debajo de la grilla. Con flexbox el grid
              siempre ocupa exactamente lo que sobra, sin mantener un número a mano. */}
          <div className="min-h-0 flex-1">
            <MonthGrid
              month={currentMonth}
              events={visibleEvents}
              canEdit={canEdit}
              shortLabels={shortLabels}
              onSelectEvent={setDetailEvent}
            />
          </div>
        </div>

        <DragOverlay>
          {activeDrag && (
            <div className="w-40">
              <EventPill
                event={activeDrag.event}
                canEdit={canEdit}
                isOverlayPreview
                label={
                  (activeDrag.event.sourceKey &&
                    shortLabels[activeDrag.event.sourceKey]) ||
                  (activeDrag.event.display === "marker"
                    ? "Vencimiento"
                    : activeDrag.event.title)
                }
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <aside className="flex h-56 w-full shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-slate-400/40 bg-linear-to-br from-background/60 to-background/30 p-4 backdrop-blur-sm dark:border-slate-600/40 md:h-full md:w-72">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>

          {/* Solo tiene sentido filtrar cuando hay más de una fuente a la vista. */}
          {availableFilterKeys.length > 1 && (
            <DropdownMenu>
              <TooltipProvider disableHoverableContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                      >
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
        {/* min-h-0: sin esto, este hijo flex de un flex-col solo TOMA a
            flex-1 como mínimo — con pocos eventos su contenido real es más
            bajo que el espacio disponible, así que se encoge a su contenido
            en vez de llenarlo, y el aside (con overflow-hidden) queda
            visiblemente más corto que el calendario de al lado. */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto *:[content-visibility:auto] *:[contain-intrinsic-size:auto_58px]">
          {eventsInView.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <CalendarX2 className="size-6" />
              <p className="text-xs">Sin eventos este mes.</p>
            </div>
          ) : (
            <TooltipProvider disableHoverableContent delayDuration={200}>
              {eventsInView.map((event) => {
                // Tres formas de fila, por lo que se puede HACER con ella: el
                // evento manual propio se edita, el automático con módulo
                // dueño lleva a su ficha, y el resto solo informa. Nunca se
                // dibuja una fila que parece accionable y no hace nada.
                if (event.editable) {
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => openEditDialog(event)}
                          className="w-full rounded-lg border border-slate-400/40 bg-background/60 p-2.5 text-left text-sm transition-colors hover:border-blue-400/40 dark:border-slate-600/40"
                        >
                          <p className="truncate font-medium leading-tight">
                            {event.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatSidebarTime(event)}
                          </p>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{event.title}</TooltipContent>
                    </Tooltip>
                  );
                }

                if (event.url) {
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => openEventUrl(event.url as string)}
                          className={cn(
                            "group w-full rounded-lg border border-transparent p-2.5 text-left text-sm transition-colors",
                            "hover:border-blue-400/40 hover:bg-background/60",
                            event.display === "marker"
                              ? "opacity-70"
                              : "bg-background/40",
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  event.color ?? "hsl(var(--muted-foreground))",
                              }}
                            />
                            <p className="truncate leading-tight">
                              {event.title}
                            </p>
                            <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="mt-0.5 pl-3 text-xs text-muted-foreground">
                            {formatSidebarTime(event)}
                          </p>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Ver detalle: {event.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-full rounded-lg border border-transparent p-2.5 text-sm",
                          event.display === "marker"
                            ? "opacity-70"
                            : "bg-background/40",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                event.color ?? "hsl(var(--muted-foreground))",
                            }}
                          />
                          <p className="truncate leading-tight">
                            {event.title}
                          </p>
                        </div>
                        <p className="mt-0.5 pl-3 text-xs text-muted-foreground">
                          {formatSidebarTime(event)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{event.title}</TooltipContent>
                  </Tooltip>
                );
              })}
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

      <EventDetailDialog
        open={!!detailEvent}
        onOpenChange={(open) => {
          if (!open) setDetailEvent(undefined);
        }}
        event={detailEvent}
        sourceLabel={
          sourceLabels[detailEvent?.sourceKey ?? MANUAL_SOURCE_KEY] ?? "Evento"
        }
        onEdit={openEditDialog}
        onNavigate={openEventUrl}
      />
    </div>
  );
}
