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
                set((state) => ({
                    dismissedAt: {
                        ...state.dismissedAt,
                        [alertId]: new Date().toDateString(),
                    },
                })),
            isDismissedToday: (alertId) => get().dismissedAt[alertId] === new Date().toDateString(),
        }),
        {
            name: "criticalAlertsDismissed",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
