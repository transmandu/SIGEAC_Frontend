import { useEffect, useEffectEvent, type RefObject } from "react";
import { toast } from "sonner";
import type { LibraryView } from "@/components/library/LibraryToolbar";
import type { LibraryDocument } from "@/lib/Library/document-info";
import {
  gridColumns,
  hasOpenOverlay,
  idsBetween,
  isInteractiveTarget,
  isNavigationKey,
  nextIndex,
} from "@/lib/Library/shortcuts";

interface UseDocumentShortcutsOptions {
  /** Apagado mientras haya un visor o un panel encima: el teclado es suyo. */
  enabled: boolean;
  documents: LibraryDocument[];
  view: LibraryView;
  gridRef: RefObject<HTMLElement | null>;
  /** El documento donde está el cursor del teclado. */
  activeId: number | null;
  setActiveId: (id: number | null) => void;
  selectedIds: number[];
  /** Sin él (quien no gestiona) no hay selección: solo moverse, abrir y favoritos. */
  onSelectionChange?: (ids: number[]) => void;
  /** Ejecuta una acción del menú del documento; `false` si no la tiene (permisos). */
  runAction: (id: number, key: string) => boolean;
}

/**
 * Atajos de teclado de la lista de documentos, al estilo de un explorador:
 * flechas mueven el cursor (Mays amplía la selección), Enter abre, espacio
 * marca, Ctrl+A selecciona todo, F2 renombra, Supr elimina, Esc suelta.
 *
 * No actúa si el foco está en algo que ya usa el teclado (un campo, un botón,
 * un menú) ni si hay un diálogo o menú abierto. Las acciones salen de la misma
 * lista de permisos que el «⋯» y el clic derecho: lo que allí no esté, aquí
 * tampoco ocurre.
 */
export function useDocumentShortcuts({
  enabled,
  documents,
  view,
  gridRef,
  activeId,
  setActiveId,
  selectedIds,
  onSelectionChange,
  runAction,
}: UseDocumentShortcutsOptions) {
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return;
    if (isInteractiveTarget(event.target) || hasOpenOverlay()) return;

    const ids = documents.map((doc) => doc.id);
    const withModifier = event.ctrlKey || event.metaKey;

    if (withModifier && event.key.toLowerCase() === "a") {
      if (!onSelectionChange || ids.length === 0) return;
      event.preventDefault();
      onSelectionChange(ids);
      return;
    }

    if (withModifier || event.altKey) return;

    if (isNavigationKey(event.key)) {
      const current = activeId === null ? -1 : ids.indexOf(activeId);
      const next = nextIndex(
        event.key,
        current,
        ids.length,
        gridColumns(gridRef.current),
        view === "grid",
      );
      if (next === null) return;

      event.preventDefault();
      setActiveId(ids[next]);

      if (event.shiftKey && onSelectionChange) {
        const anchor = current < 0 ? next : current;
        onSelectionChange([
          ...new Set([...selectedIds, ...idsBetween(ids, anchor, next)]),
        ]);
      }
      return;
    }

    switch (event.key) {
      case "Enter":
        if (activeId !== null && runAction(activeId, "view")) {
          event.preventDefault();
        }
        break;

      case "F2":
        if (activeId !== null && runAction(activeId, "rename")) {
          event.preventDefault();
        }
        break;

      case "Delete":
        if (activeId === null) break;
        event.preventDefault();
        // El diálogo de eliminar es de un documento: con varios marcados no
        // queda claro cuál se quiere, así que se pide uno solo.
        if (selectedIds.length > 1) {
          toast.info("Elimine los documentos de uno en uno.");
        } else {
          runAction(activeId, "delete");
        }
        break;

      case " ":
        if (activeId === null || !onSelectionChange) break;
        event.preventDefault();
        onSelectionChange(
          selectedIds.includes(activeId)
            ? selectedIds.filter((id) => id !== activeId)
            : [...selectedIds, activeId],
        );
        break;

      case "Escape":
        if (activeId === null && selectedIds.length === 0) break;
        setActiveId(null);
        onSelectionChange?.([]);
        break;
    }
  });

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
