import { useMemo } from "react";
import { useLowStockAlerts } from "./useLowStockAlerts";
import { useQuarantineAlerts } from "./useQuarantineAlerts";
import { useDismissedAlertsStore } from "./useDismissedAlertsStore";
import { useAlertFiltersStore } from "./useAlertFiltersStore";
import { CriticalAlert } from "./types";

/**
 * Una alerta es accionable cuando todavía no hay nada comprado para ella: es
 * la que exige que alguien pida. Las de tránsito solo informan que la
 * reposición viene en camino.
 */
const isActionable = (alert: CriticalAlert) => alert.severity !== "in-transit";

export const useCriticalAlerts = () => {
    const { alerts: lowStockAlerts, isLoading: isLoadingLowStock } = useLowStockAlerts();
    const { alerts: quarantineAlerts, isLoading: isLoadingQuarantine } = useQuarantineAlerts();
    const dismissedAt = useDismissedAlertsStore((state) => state.dismissedAt);
    const hideInTransit = useAlertFiltersStore((state) => state.hideInTransit);

    // Nuevas fuentes de alertas críticas se agregan aquí como entradas adicionales.
    const allAlerts = useMemo<CriticalAlert[]>(() => {
        return [...lowStockAlerts, ...quarantineAlerts];
    }, [lowStockAlerts, quarantineAlerts]);

    const visibleAlerts = useMemo<CriticalAlert[]>(() => {
        const today = new Date().toDateString();

        return allAlerts.filter((alert) => dismissedAt[alert.id] !== today);
    }, [allAlerts, dismissedAt]);

    // Las accionables primero: son las únicas que piden una decisión, y quien
    // abre el panel debe encontrarlas sin desplazarse entre las de tránsito.
    const alerts = useMemo<CriticalAlert[]>(() => {
        const shown = hideInTransit ? visibleAlerts.filter(isActionable) : visibleAlerts;

        return [...shown].sort((a, b) => Number(isActionable(b)) - Number(isActionable(a)));
    }, [visibleAlerts, hideInTransit]);

    const actionableCount = useMemo(
        () => visibleAlerts.filter(isActionable).length,
        [visibleAlerts],
    );

    const inTransitCount = visibleAlerts.length - actionableCount;

    return {
        alerts,
        /**
         * Mide lo accionable, no el total: un artículo ya comprado no debe
         * inflar el contador ni empujar a revisar algo que no requiere acción.
         * Sin nada accionable cae al número de las que vienen en camino, para
         * que el botón siga comunicando que hay stock bajo pendiente de llegar.
         */
        count: actionableCount > 0 ? actionableCount : inTransitCount,
        /** Distingue qué está contando `count`, para el estilo y el texto. */
        isCountActionable: actionableCount > 0,
        actionableCount,
        inTransitCount,
        isLoading: isLoadingLowStock || isLoadingQuarantine,
    };
};
