import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Sin techo el registro crecería una entrada por cada cambio de prioridad que
 * el usuario haya visto, para siempre. Solo importan los recientes: uno viejo
 * que se olvida se vuelve a mostrar desplegado una vez, sin más.
 */
const MAX_REMEMBERED = 200;

interface SeenPriorityChangesStore {
  seen: string[];
  markSeen: (key: string) => void;
}

/**
 * Qué cambios de prioridad ya vio este navegador, para mostrarlos desplegados
 * la primera vez y plegados después. Es una comodidad por navegador: en otro
 * equipo el aviso vuelve a abrirse una vez, sin consecuencias.
 */
export const useSeenPriorityChanges = create<SeenPriorityChangesStore>()(
  persist(
    (set) => ({
      seen: [],
      markSeen: (key) =>
        set((state) =>
          state.seen.includes(key)
            ? state
            : { seen: [...state.seen, key].slice(-MAX_REMEMBERED) },
        ),
    }),
    {
      name: "seenRequisitionPriorityChanges",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
