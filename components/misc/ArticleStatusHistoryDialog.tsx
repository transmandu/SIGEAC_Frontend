"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransitUpdatesReadOnlyDialog } from "@/components/dialogs/mantenimiento/almacen/TransitUpdatesReadOnlyDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetArticleStatusHistory,
  type ArticleHistoryEvent,
  type ArticleStatusTimelineEntry,
  type MergedArrival,
} from "@/hooks/mantenimiento/almacen/articulos/useGetArticleStatusHistory";
import {
  isMovementMilestone,
  timelineEntryLabel,
} from "@/lib/warehouse/statuses";
import { useCompanyStore } from "@/stores/CompanyStore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronDown,
  GitMerge,
  Loader2,
  NotebookPen,
  PackageOpen,
} from "lucide-react";
import { useState } from "react";

/**
 * "3 d 4 h", "45 min": la unidad mayor y la que le sigue bastan para leer la
 * permanencia. Se toman contiguas —no las dos mayores con valor— para no
 * producir saltos como "296 d 57 min", que se lee como si faltara algo.
 */
const formatDuration = (seconds: number) => {
  if (seconds < 60) return "menos de 1 min";

  const units = [
    { label: "d", value: Math.floor(seconds / 86400) },
    { label: "h", value: Math.floor((seconds % 86400) / 3600) },
    { label: "min", value: Math.floor((seconds % 3600) / 60) },
  ];

  const first = units.findIndex((unit) => unit.value > 0);

  return units
    .slice(first, first + 2)
    .filter((unit) => unit.value > 0)
    .map((unit) => `${unit.value} ${unit.label}`)
    .join(" ");
};

const formatMoment = (value: string) => {
  const date = parseISO(value);
  return isNaN(date.getTime())
    ? "Fecha inválida"
    : format(date, "dd/MM/yyyy HH:mm", { locale: es });
};

type FeedItem =
  | { kind: "status"; at: string; entry: ArticleStatusTimelineEntry }
  | { kind: "event"; at: string; event: ArticleHistoryEvent };

/**
 * Estados y hechos en una sola línea de tiempo, del más reciente al más
 * antiguo: lo que pasó con el artículo se lee de corrido, sin tener que cruzar
 * dos listas.
 */
const buildFeed = (
  timeline: ArticleStatusTimelineEntry[],
  events: ArticleHistoryEvent[],
): FeedItem[] =>
  [
    ...timeline.map((entry): FeedItem => ({
      kind: "status",
      at: entry.from,
      entry,
    })),
    ...events.map((event): FeedItem => ({
      kind: "event",
      at: event.at,
      event,
    })),
  ].sort((a, b) => parseISO(b.at).getTime() - parseISO(a.at).getTime());

const EVENT_META = {
  MERGE: {
    icon: GitMerge,
    label: "Se unió otra llegada",
    tone: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300",
  },
  PARTIAL_RECEPTION: {
    icon: PackageOpen,
    label: "Recepción parcial",
    tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  },
} as const;

function HistoryEventCard({ event }: { event: ArticleHistoryEvent }) {
  const meta = EVENT_META[event.type];
  const Icon = meta.icon;

  return (
    <div className={`rounded-lg border px-2.5 py-2 text-xs ${meta.tone}`}>
      <p className="flex items-center gap-1.5 font-semibold">
        <Icon className="size-3.5" />
        {meta.label}
      </p>
      {event.text && <p className="mt-0.5 opacity-90">{event.text}</p>}
      <p className="mt-1 opacity-80">
        {formatMoment(event.at)}
        {event.registered_by ? ` · Registrado por: ${event.registered_by}` : ""}
      </p>
    </div>
  );
}

/** El camino de una llegada que se unió al artículo, plegado por defecto. */
function MergedArrivalBlock({ arrival }: { arrival: MergedArrival }) {
  const feed = buildFeed(arrival.timeline, arrival.events);
  const amount =
    arrival.quantity != null
      ? `${Number(arrival.quantity.toFixed(4))}${arrival.unit ? ` ${arrival.unit}` : ""}`
      : null;

  return (
    <Collapsible className="rounded-lg border">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden">
        <span className="min-w-0">
          <span className="font-medium">Llegada #{arrival.id}</span>
          {amount && <span className="text-muted-foreground"> · {amount}</span>}
          {arrival.received_at && (
            <span className="block text-xs text-muted-foreground">
              Recibida el {formatMoment(arrival.received_at)}
            </span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 border-t px-3 py-2.5">
        {feed.map((item) =>
          item.kind === "event" ? (
            <HistoryEventCard
              key={`event-${item.at}-${item.event.type}`}
              event={item.event}
            />
          ) : (
            <div
              key={`status-${item.at}-${item.entry.status}`}
              className="flex flex-wrap items-center gap-x-2 text-xs"
            >
              <Badge variant="secondary">
                {timelineEntryLabel(item.entry.status)}
              </Badge>
              <span className="text-muted-foreground">
                {formatMoment(item.entry.from)}
                {item.entry.until ? ` → ${formatMoment(item.entry.until)}` : ""}
              </span>
            </div>
          ),
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ArticleStatusHistoryDialog({
  articleId,
  open,
  onOpenChange,
}: {
  articleId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const [transitUpdatesOpen, setTransitUpdatesOpen] = useState(false);

  // Solo se consulta con el diálogo abierto: la tabla monta una acción por fila.
  const { data, isLoading, isError } = useGetArticleStatusHistory(
    articleId,
    selectedCompany?.slug,
    open,
  );

  const timeline = data?.timeline ?? [];
  const feed = buildFeed(timeline, data?.events ?? []);
  const mergedArticles = data?.merged_articles ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            Historial de movimiento de estados
          </DialogTitle>
          <DialogDescription className="text-center">
            Estados y hechos del artículo, del más reciente al más antiguo.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No se pudo cargar el historial de estados.
          </p>
        )}

        {!isLoading && !isError && timeline.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Este artículo no tiene movimientos de estado registrados.
          </p>
        )}

        {!isLoading && !isError && data?.merged_into && (
          <p className="flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300">
            <GitMerge className="size-4 shrink-0" />
            <span>
              Este artículo se unió al artículo{" "}
              <span className="font-semibold">#{data.merged_into.id}</span>
              {data.merged_into.part_number
                ? ` (${data.merged_into.part_number})`
                : ""}
              : su existencia ya cuenta allí, y aquí queda su historial.
            </span>
          </p>
        )}

        {!isLoading && !isError && timeline.length > 0 && (
          <ScrollArea className="max-h-[60vh] pr-4">
            <ol className="relative border-l border-border ml-3 space-y-6 py-2">
              {feed.map((item) => {
                if (item.kind === "event") {
                  return (
                    <li
                      key={`event-${item.at}-${item.event.type}`}
                      className="ml-6"
                    >
                      <span className="absolute -left-1.75 flex size-3.5 rounded-full border-2 border-background bg-sky-500" />
                      <HistoryEventCard event={item.event} />
                    </li>
                  );
                }

                const entry = item.entry;
                const isCurrent = entry.until === null;
                const isMilestone = isMovementMilestone(entry.status);

                return (
                  <li key={`${entry.from}-${entry.status}`} className="ml-6">
                    <span
                      className={`absolute -left-1.75 flex size-3.5 rounded-full border-2 border-background ${
                        isCurrent ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          isCurrent
                            ? "default"
                            : isMilestone
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {timelineEntryLabel(entry.status)}
                      </Badge>
                      {isCurrent && (
                        <span className="text-xs text-muted-foreground italic">
                          estado actual
                        </span>
                      )}
                      {entry.status === "TRANSIT" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Ver la bitácora de tránsito"
                          title="Ver la bitácora de tránsito"
                          onClick={() => setTransitUpdatesOpen(true)}
                          className="size-6 text-muted-foreground hover:text-foreground"
                        >
                          <NotebookPen className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <p className="text-sm mt-1">
                      {formatMoment(entry.from)}
                      {entry.until ? ` → ${formatMoment(entry.until)}` : ""}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {isCurrent ? "Lleva " : "Permaneció "}
                      <span className="font-semibold">
                        {formatDuration(entry.seconds)}
                      </span>
                    </p>

                    {entry.registered_by && (
                      <p className="text-xs text-muted-foreground">
                        Pasó a este estado por:{" "}
                        <span className="font-medium text-foreground">
                          {entry.registered_by}
                        </span>
                      </p>
                    )}

                    {entry.dispatch && (
                      <p className="text-xs text-muted-foreground">
                        {entry.dispatch.returned
                          ? "Lo había recibido: "
                          : "Entregado a: "}
                        <span className="font-medium text-foreground">
                          {[
                            entry.dispatch.who ?? "sin receptor",
                            entry.dispatch.destination,
                            entry.dispatch.request_number
                              ? `Salida ${entry.dispatch.request_number}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </p>
                    )}

                    {entry.note && (
                      <p className="text-xs text-muted-foreground">
                        {entry.note}
                      </p>
                    )}

                    {entry.authorized_by && (
                      <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800/60 dark:bg-amber-950/40">
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                          <span className="font-semibold">Autorizado por:</span>{" "}
                          {entry.authorized_by}
                        </p>
                        {entry.authorization_reason && (
                          <p className="mt-0.5 text-xs text-amber-700/90 dark:text-amber-400/80">
                            {entry.authorization_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {mergedArticles.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <p className="text-[13px] font-semibold text-foreground/80">
                  Llegadas unidas a este artículo
                </p>
                {mergedArticles.map((arrival) => (
                  <MergedArrivalBlock key={arrival.id} arrival={arrival} />
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {transitUpdatesOpen && (
          <TransitUpdatesReadOnlyDialog
            articleId={Number(articleId)}
            open={transitUpdatesOpen}
            onOpenChange={setTransitUpdatesOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
