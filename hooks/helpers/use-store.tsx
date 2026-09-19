"use client";

import { useSyncExternalStore } from "react";

type PersistStore = {
  persist?: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

const noopSubscribe = () => () => {};

/**
 * true cuando zustand terminó de leer localStorage.
 *
 * El snapshot de servidor es siempre false para que el HTML y el primer render
 * del cliente coincidan; recién después la suscripción reporta el valor real.
 * Con useSyncExternalStore no hace falta un setState en efecto: React lee el
 * estado de hidratación directamente del store.
 */
export const useStoreHydrated = (store: PersistStore): boolean => {
  return useSyncExternalStore(
    store.persist?.onFinishHydration ?? noopSubscribe,
    () => store.persist?.hasHydrated() ?? true,
    () => false,
  );
};
