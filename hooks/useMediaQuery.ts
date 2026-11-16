import { useSyncExternalStore } from "react";

/**
 * Si la ventana cumple la consulta. En el servidor y durante la hidratación
 * responde `false`: el primer pintado es el de móvil y se corrige al montar.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
