import { useMemo } from "react";
import { useLowStockAlerts } from "./useLowStockAlerts";
import { useDismissedAlertsStore } from "./useDismissedAlertsStore";
import { CriticalAlert } from "./types";

export const useCriticalAlerts = () => {
    const { alerts: lowStockAlerts, isLoading: isLoadingLowStock } = useLowStockAlerts();
    const dismissedAt = useDismissedAlertsStore((state) => state.dismissedAt);

    // Nuevas fuentes de alertas críticas se agregan aquí como entradas adicionales.
    const allAlerts = useMemo<CriticalAlert[]>(() => {
        return [...lowStockAlerts];
    }, [lowStockAlerts]);

    const alerts = useMemo<CriticalAlert[]>(() => {
        const today = new Date().toDateString();
        return allAlerts.filter((alert) => dismissedAt[alert.id] !== today);
    }, [allAlerts, dismissedAt]);

    return {
        alerts,
        count: alerts.length,
        isLoading: isLoadingLowStock,
    };
};
