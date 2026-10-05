"use client";

import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarClock,
  NotebookText,
  PencilLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocalCalendarEvent } from "./types";

function formatModalDateRange(start: Date, end: Date, allDay: boolean): string {
  if (allDay) {
    return isSameDay(start, end)
      ? `${format(start, "d 'de' MMMM, yyyy", { locale: es })} — Todo el día`
      : `${format(start, "d MMM", { locale: es })} – ${format(end, "d 'de' MMMM, yyyy", { locale: es })} — Todo el día`;
  }

  return `${format(start, "d 'de' MMMM, yyyy — H:mm", { locale: es })} – ${format(end, "H:mm", { locale: es })}`;
}

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LocalCalendarEvent | undefined;
  sourceLabel: string;
  onEdit: (event: LocalCalendarEvent) => void;
  onNavigate: (url: string) => void;
}

/**
 * Reemplaza el eventModal de Schedule-X. DialogContent plano (mismo estilo
 * que CreateEventDialog, sin el gradiente/blur del modal viejo) para que los
 * dos diálogos de esta página lean como parte del mismo sistema.
 */
export function EventDetailDialog({
  open,
  onOpenChange,
  event,
  sourceLabel,
  onEdit,
  onNavigate,
}: EventDetailDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-xs text-muted-foreground">{sourceLabel}</p>

        <div className="space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
            <span>
              {formatModalDateRange(
                event.start,
                event.end,
                event.allDay ?? false,
              )}
            </span>
          </div>
          {event.description && (
            <div className="flex items-start gap-2">
              <NotebookText className="mt-0.5 size-4 shrink-0" />
              <span>{event.description}</span>
            </div>
          )}
        </div>

        {/* Sin acción disponible no se dibuja el botón: los automáticos se ven en su propio módulo, los manuales se editan acá. */}
        {(event.url || event.editable) && (
          <div className="flex justify-end gap-2">
            {event.url && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onNavigate(event.url as string);
                }}
              >
                <ArrowUpRight className="mr-2 size-4" />
                Ver detalle
              </Button>
            )}
            {event.editable && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(event);
                }}
              >
                <PencilLine className="mr-2 size-4" />
                Editar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
