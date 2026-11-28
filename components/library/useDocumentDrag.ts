import { useCallback, type DragEvent } from "react";
import { DOCS_MIME } from "@/lib/Library/drag";
import { isOwnEvent } from "@/lib/Library/shortcuts";

/**
 * Arrastrar un documento (fila o tarjeta). Si está dentro de la selección viajan
 * todos los seleccionados; si no, solo él. `enabled` es el permiso de moverlos.
 */
export function useDocumentDrag(
  id: number,
  departmentName: string | undefined,
  getDragIds: ((id: number) => number[]) | undefined,
  enabled: boolean,
) {
  const onDragStart = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!isOwnEvent(event)) return;
      const ids = getDragIds?.(id) ?? [id];
      event.dataTransfer.setData("text/plain", id.toString());
      event.dataTransfer.setData(DOCS_MIME, JSON.stringify(ids));
      event.dataTransfer.setData("text/dept-name", departmentName || "");
      event.dataTransfer.effectAllowed = "move";
      event.currentTarget.classList.add("opacity-40");
    },
    [id, departmentName, getDragIds],
  );

  const onDragEnd = useCallback((event: DragEvent<HTMLElement>) => {
    event.currentTarget.classList.remove("opacity-40");
  }, []);

  return enabled
    ? { draggable: true as const, onDragStart, onDragEnd }
    : { draggable: false as const };
}
