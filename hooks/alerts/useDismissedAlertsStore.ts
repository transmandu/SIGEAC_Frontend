import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DismissedAlertsStore {
    dismissedAt: Record<string, string>;
    dismiss: (alertId: string) => void;
    isDismissedToday: (alertId: string) => boolean;
}

export const useDismissedAlertsStore = create<DismissedAlertsStore>()(
    persist(
        (set, get) => ({
            dismissedAt: {},
            dismiss: (alertId) =>
                set((state) => {
                    const today = new Date().toDateString();

                    // El descarte solo vale por hoy, así que lo de días previos
                    // ya no se consulta nunca. Sin esta poda el registro crece
                    // sin techo: cada artículo descartado deja una entrada viva
                    // en localStorage para siempre.
                    const fresh: Record<string, string> = {};
                    for (const [id, date] of Object.entries(state.dismissedAt)) {
                        if (date === today) fresh[id] = date;
                    }

                    fresh[alertId] = today;

                    return { dismissedAt: fresh };
                }),
            isDismissedToday: (alertId) => get().dismissedAt[alertId] === new Date().toDateString(),
        }),
        {
            name: "criticalAlertsDismissed",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
