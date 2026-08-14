import { useMemo } from "react";
import { useLowStockAlerts } from "./useLowStockAlerts";
import { useQuarantineAlerts } from "./useQuarantineAlerts";
import { useDismissedAlertsStore } from "./useDismissedAlertsStore";
import { useAlertFiltersStore } from "./useAlertFiltersStore";
import {
    CriticalAlert,
    CriticalAlertTone,
    alertCountsAsPending,
    alertTone,
    isAlertDismissable,
} from "./types";

/**
 * Concentra las fuentes de alertas y resuelve orden, descarte y conteo, pero
 * no sabe qué significa ninguna: cada alerta declara su peso, si se descarta,
 * si cuenta como pendiente y con qué tarjeta se dibuja. Sumar una fuente nueva
 * es agregarla aquí y nada más.
 */
export const useCriticalAlerts = () => {
    const { alerts: lowStockAlerts, isLoading: isLoadingLowStock } = useLowStockAlerts();
    const { alerts: quarantineAlerts, isLoading: isLoadingQuarantine } = useQuarantineAlerts();
    const dismissedAt = useDismissedAlertsStore((state) => state.dismissedAt);
    const hideInTransit = useAlertFiltersStore((state) => state.hideInTransit);

    // Nuevas fuentes de alertas críticas se agregan aquí como entradas adicionales.
    const allAlerts = useMemo<CriticalAlert[]>(() => {
        const merged = [...lowStockAlerts, ...quarantineAlerts];

        // El id es la llave de React y del descarte: repetirlo haría que un
        // descarte oculte dos alertas distintas. Se avisa en desarrollo porque
        // el síntoma en producción es silencioso y difícil de rastrear.
        if (process.env.NODE_ENV !== "production") {
            const seen = new Set<string>();
            const duplicated = merged
                .map((alert) => alert.id)
                .filter((id) => seen.has(id) || (seen.add(id), false));

            if (duplicated.length > 0) {
                console.warn("[useCriticalAlerts] ids de alerta duplicados:", duplicated);
            }
        }

        return merged;
    }, [lowStockAlerts, quarantineAlerts]);

    const visibleAlerts = useMemo<CriticalAlert[]>(() => {
        const today = new Date().toDateString();

        // Una alerta no descartable ignora el registro de descartes: aunque
        // quede uno viejo guardado, debe volver a verse.
        return allAlerts.filter(
            (alert) => !isAlertDismissable(alert) || dismissedAt[alert.id] !== today,
        );
    }, [allAlerts, dismissedAt]);

    // Peso declarado primero; a igual peso se conserva el orden de llegada.
    const alerts = useMemo<CriticalAlert[]>(() => {
        const shown = hideInTransit
            ? visibleAlerts.filter(alertCountsAsPending)
            : visibleAlerts;

        return shown
            .map((alert, index) => ({ alert, index }))
            .sort((a, b) => {
                const byWeight = (b.alert.weight ?? 0) - (a.alert.weight ?? 0);
                return byWeight !== 0 ? byWeight : a.index - b.index;
            })
            .map(({ alert }) => alert);
    }, [visibleAlerts, hideInTransit]);

    const pendingAlerts = useMemo(
        () => visibleAlerts.filter(alertCountsAsPending),
        [visibleAlerts],
    );

    const pendingCount = pendingAlerts.length;
    const inTransitCount = visibleAlerts.length - pendingCount;

    /**
     * El tono lo deciden las alertas presentes, no una jerarquía fija: a quien
     * solo ve cuarentena no se le habla de reponer, y a almacén no se le habla
     * de plazos legales. Con las dos cosas a la vista no se elige una.
     */
    const tone = useMemo<CriticalAlertTone | "mixed">(() => {
        const tones = pendingAlerts.map(alertTone);

        if (tones.length === 0) return "restock";

        const first = tones[0];
        return tones.every((value) => value === first) ? first : "mixed";
    }, [pendingAlerts]);

    // Contador por tono sin enumerar los tonos: un tono nuevo aparece solo.
    const toneCounts = useMemo(() => {
        return pendingAlerts.reduce((acc, alert) => {
            const key = alertTone(alert);
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {} as Partial<Record<CriticalAlertTone, number>>);
    }, [pendingAlerts]);

    return {
        alerts,
        /**
         * Mide lo pendiente, no el total: un artículo ya comprado no debe
         * inflar el contador ni empujar a revisar algo que no requiere acción.
         * Sin nada pendiente cae al número de las que vienen en camino, para
         * que el botón siga comunicando que hay stock por llegar.
         */
        count: pendingCount > 0 ? pendingCount : inTransitCount,
        /** Distingue qué está contando `count`, para el estilo y el texto. */
        isCountActionable: pendingCount > 0,
        tone,
        toneCounts,
        actionableCount: pendingCount,
        inTransitCount,
        isLoading: isLoadingLowStock || isLoadingQuarantine,
    };
};
