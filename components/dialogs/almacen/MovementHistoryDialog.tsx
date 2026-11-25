"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetIndividualHistory,
  useGetToolBoxHistory,
  type IndividualHistoryEvent,
  type ToolBoxHistoryEntry,
} from "@/hooks/mantenimiento/almacen/almacen_general/useMovementHistory";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { statusOptionLabel } from "@/lib/warehouse/statuses";
import {
  INDIVIDUAL_STATUS_LABEL,
  type IndividualStatus,
  type ToolHolder,
} from "@/types/general-article-individual";

interface Entry {
  key: string;
  at: string;
  title: string;
  /** De qué es el hecho cuando la lista mezcla varias cosas (caja, herramienta). */
  subject?: string | null;
  detail?: string | null;
  by?: string | null;
  dispatch?: ToolHolder | null;
  /** El hecho es un regreso: la entrega que se muestra es la que se cerraba. */
  returned?: boolean;
}

const INDIVIDUAL_EVENT_TITLE: Record<string, string> = {
  IDENTIFIED: "Identificado",
  UPDATED: "Identificador corregido",
};

const BOX_EVENT_TITLE: Record<string, string> = {
  CREATED: "Caja creada",
  DISPATCHED: "Salida de la caja",
};

const individualTitle = (
  event: string,
  status: IndividualStatus | null,
): string =>
  event === "STATUS" && status
    ? INDIVIDUAL_STATUS_LABEL[status]
    : (INDIVIDUAL_EVENT_TITLE[event] ?? event);

/** "Entregado a María Pérez · Aeronave YV1234 · Salida 000123 · con la caja". */
function dispatchText(dispatch: ToolHolder, returned?: boolean) {
  return [
    returned ? "Lo había recibido" : "Entregado a",
    [
      dispatch.who ?? "sin receptor",
      dispatch.destination,
      dispatch.request_number ? `Salida ${dispatch.request_number}` : null,
      dispatch.with_box ? "con la caja" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  ].join(": ");
}

function Timeline({ entries }: { entries: Entry[] }) {
  const timeZone = useCompanyTimezone();

  return (
    <ol className="relative ml-2 space-y-4 border-l pl-5">
      {entries.map((entry) => (
        <li key={entry.key} className="relative">
          <span className="absolute left-[-1.62rem] top-1.5 size-2 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{entry.title}</Badge>
            {entry.subject && (
              <span className="text-sm font-medium">{entry.subject}</span>
            )}
          </div>
          <p className="mt-1 text-sm">
            {formatInstant(entry.at, timeZone, "dateTime")}
          </p>
          {entry.by && (
            <p className="text-xs text-muted-foreground">
              Lo hizo:{" "}
              <span className="font-medium text-foreground">{entry.by}</span>
            </p>
          )}
          {entry.dispatch && (
            <p className="text-xs text-muted-foreground">
              {dispatchText(entry.dispatch, entry.returned)}
            </p>
          )}
          {entry.detail && (
            <p className="text-xs text-muted-foreground">{entry.detail}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

function HistoryShell({
  open,
  onOpenChange,
  title,
  subtitle,
  isLoading,
  isError,
  entries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string | null;
  isLoading: boolean;
  isError: boolean;
  entries: Entry[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[min(640px,96vw)] flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-center text-2xl leading-tight">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-center">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-8 animate-spin" />
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No se pudo cargar el historial.
            </p>
          ) : entries.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Todavía no hay movimientos.
            </p>
          ) : (
            <Timeline entries={entries} />
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface IndividualProps {
  individualId: number | null;
  onOpenChange: (open: boolean) => void;
}

/** Historial de un artículo individual. Abierto mientras haya un id. */
export function IndividualHistoryDialog({
  individualId,
  onOpenChange,
}: IndividualProps) {
  const { data, isLoading, isError } = useGetIndividualHistory(individualId);

  const entries = (data?.events ?? []).map(
    (event: IndividualHistoryEvent, index): Entry => ({
      key: `${event.at}-${index}`,
      at: event.at,
      title: individualTitle(event.event, event.status),
      detail: event.detail,
      by: event.by,
      dispatch: event.dispatch,
      returned: event.dispatch?.returned,
    }),
  );

  return (
    <HistoryShell
      open={individualId !== null}
      onOpenChange={onOpenChange}
      title={data ? data.individual.identifier : "Historial"}
      subtitle={data?.individual.description}
      isLoading={isLoading}
      isError={isError}
      entries={entries}
    />
  );
}

interface BoxProps {
  toolBoxId: number | null;
  onOpenChange: (open: boolean) => void;
}

/** Historial de una caja y de lo que guarda. Abierto mientras haya un id. */
export function ToolBoxHistoryDialog({ toolBoxId, onOpenChange }: BoxProps) {
  const { data, isLoading, isError } = useGetToolBoxHistory(toolBoxId);

  const entries = (data?.entries ?? []).map(
    (entry: ToolBoxHistoryEntry, index): Entry => {
      const status = entry.status ?? "";

      return {
        key: `${entry.at}-${index}`,
        at: entry.at,
        subject: entry.subject,
        title:
          entry.source === "BOX"
            ? (BOX_EVENT_TITLE[entry.event] ?? entry.event)
            : entry.source === "TOOL"
              ? statusOptionLabel(status)
              : individualTitle(entry.event, entry.status as IndividualStatus),
        detail: entry.detail,
        by: entry.by,
        dispatch: entry.dispatch,
        returned: entry.dispatch?.returned,
      };
    },
  );

  return (
    <HistoryShell
      open={toolBoxId !== null}
      onOpenChange={onOpenChange}
      title={data ? `Historial de ${data.box.name}` : "Historial"}
      subtitle="La caja y lo que guarda"
      isLoading={isLoading}
      isError={isError}
      entries={entries}
    />
  );
}
