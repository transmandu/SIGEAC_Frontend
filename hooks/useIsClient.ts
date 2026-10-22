import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` mientras se renderiza en el servidor y durante la hidratación, `true`
 * después. Sirve para pintar solo en el navegador lo que depende de `window`,
 * `localStorage` o `document` sin un `useEffect` que cambie un estado al montar.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
