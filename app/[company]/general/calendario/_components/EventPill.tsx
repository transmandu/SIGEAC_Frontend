"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import { LocalCalendarEvent } from "./types";

/** Para lo que no tiene un color propio asignado — un morado neutro, no un azul de librería. */
const DEFAULT_EVENT_COLOR = "#8b5cf6";

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

interface EventPillProps {
  event: LocalCalendarEvent;
  label: string;
  canEdit: boolean;
  isOverlayPreview?: boolean;
  onClick: () => void;
}

/**
 * Un chip de evento en una celda del mes. Arrastrable solo si el rol puede
 * editar Y el evento en particular es editable (backend) — a diferencia del
 * calendario anterior, acá un evento no editable simplemente NO se puede
 * agarrar (sin listeners/attributes de dnd-kit), así que nunca hace falta
 * "revertir" un arrastre después de soltarlo: ese caso no puede ocurrir.
 *
 * El handle de resize es un useDraggable APARTE con su propio id
 * (`resize:${event.id}`) para que EventCalendar distinga en onDragEnd si el
 * gesto fue "mover" o "cambiar el día de fin" sin dos DndContext distintos.
 */
export function EventPill({
  event,
  label,
  canEdit,
  isOverlayPreview,
  onClick,
}: EventPillProps) {
  const isMarker = event.display === "marker";
  const canDrag = canEdit && !!event.editable;

  const move = useDraggable({
    id: event.id,
    disabled: !canDrag || isOverlayPreview,
    data: { kind: "move", event },
  });

  const resize = useDraggable({
    id: `resize:${event.id}`,
    disabled: !canDrag || isMarker || isOverlayPreview,
    data: { kind: "resize", event },
  });

  const style = move.transform
    ? { transform: CSS.Translate.toString(move.transform) }
    : undefined;

  if (isMarker) {
    const color = event.color ?? "currentColor";

    return (
      <div
        ref={move.setNodeRef}
        style={style}
        {...move.listeners}
        {...move.attributes}
        onClick={onClick}
        className={cn(
          "flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded px-0.5 py-px text-left",
          move.isDragging && "opacity-40",
        )}
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span className="truncate text-[11px] leading-none">{label}</span>
      </div>
    );
  }

  const color = event.color ?? DEFAULT_EVENT_COLOR;
  const background = hexToRgba(color, 0.16) ?? "hsl(var(--muted))";

  return (
    <div
      ref={move.setNodeRef}
      style={{ ...style, background, borderLeftColor: color, color }}
      {...move.listeners}
      {...move.attributes}
      onClick={onClick}
      className={cn(
        "group/pill relative w-full cursor-pointer overflow-hidden rounded border-l-[3px] px-1.5 py-0.5 text-left text-[12px] font-semibold leading-tight",
        move.isDragging && "opacity-40",
      )}
    >
      <span className="block truncate">{label}</span>

      {canDrag && !isOverlayPreview && (
        <div
          ref={resize.setNodeRef}
          {...resize.listeners}
          {...resize.attributes}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 h-1 cursor-ns-resize opacity-0 group-hover/pill:opacity-100"
          style={{ background: color }}
        />
      )}
    </div>
  );
}
