import { useCallback, useSyncExternalStore } from "react";
import type { LibraryView } from "@/components/library/LibraryToolbar";

const KEY = "library:view";

const listeners = new Set<() => void>();

// Respaldo si el navegador no deja usar localStorage (modo privado, política).
let fallback: LibraryView | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function read(): LibraryView {
  if (fallback) return fallback;
  try {
    return localStorage.getItem(KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

/**
 * Vista elegida para los documentos (lista o cuadrícula), recordada entre
 * visitas. En el servidor y en el primer pintado es «lista»; sin estado ni
 * efecto, así que no hay parpadeo de más ni advertencias de hidratación.
 */
export function useLibraryView(): [LibraryView, (view: LibraryView) => void] {
  const view = useSyncExternalStore(subscribe, read, () => "list" as const);

  const setView = useCallback((next: LibraryView) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      fallback = next;
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [view, setView];
}
