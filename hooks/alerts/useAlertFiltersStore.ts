import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AlertFiltersStore {
    /**
     * Oculta del panel las alertas cuya reposición ya está comprada. Se
     * persiste porque es una preferencia de trabajo, no un estado de sesión:
     * quien no quiere ver el ruido no debería volver a apagarlo cada día.
     */
    hideInTransit: boolean;
    setHideInTransit: (hide: boolean) => void;
    toggleInTransit: () => void;
}

export const useAlertFiltersStore = create<AlertFiltersStore>()(
    persist(
        (set) => ({
            // Por defecto visibles: ocultarlas de entrada reintroduciría el bug
            // que este trabajo corrigió — quien va a pedir no vería que ya se
            // compró. El filtro es una salida voluntaria al ruido, no el default.
            hideInTransit: false,
            setHideInTransit: (hide) => set({ hideInTransit: hide }),
            toggleInTransit: () => set((state) => ({ hideInTransit: !state.hideInTransit })),
        }),
        {
            name: "criticalAlertsFilters",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
