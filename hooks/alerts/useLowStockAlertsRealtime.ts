import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";

/**
 * Se suscribe al canal privado low-stock-alerts.{location_id} (autorizado por
 * rol + location_users en el backend, ver routes/channels.php). El evento no
 * trae el payload de articulos: es solo una señal de que algo cambio, y aqui
 * se invalidan los 2 queries de low-stock ya existentes para que React Query
 * los vuelva a pedir. Evita duplicar en el frontend la logica SQL de deteccion
 * de bajo stock que ya vive en el backend.
 */
export const useLowStockAlertsRealtime = (locationId?: string | number, enabled: boolean = true) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled || !locationId) return;

        const echoInstance = getEcho();
        if (!echoInstance) return;

        const channelName = `low-stock-alerts.${locationId}`;
        const channel = echoInstance.private(channelName);

        const handler = () => {
            queryClient.invalidateQueries({ queryKey: ["low-stock-general-articles"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["low-stock-consumable-articles"], exact: false });
        };

        channel.listen(".low-stock-alert-changed", handler);

        return () => {
            channel.stopListening(".low-stock-alert-changed");
            echoInstance.leave(channelName);
        };
    }, [enabled, locationId, queryClient]);
};
