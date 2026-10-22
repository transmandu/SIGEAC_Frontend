import { useSyncExternalStore } from "react";

interface WindowSize {
  width: number;
  height: number;
}

const SERVER_SIZE: WindowSize = { width: 0, height: 0 };

let current: WindowSize = SERVER_SIZE;

const read = (): WindowSize => {
  if (current.width !== window.innerWidth || current.height !== window.innerHeight) {
    current = { width: window.innerWidth, height: window.innerHeight };
  }
  return current;
};

const subscribe = (notify: () => void) => {
  window.addEventListener("resize", notify);
  return () => window.removeEventListener("resize", notify);
};

/** Tamaño de la ventana; `0 × 0` en el servidor y durante la hidratación. */
export function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, read, () => SERVER_SIZE);
}
