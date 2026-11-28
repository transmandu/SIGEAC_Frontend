"use client";

import { useEffect, useEffectEvent, useMemo } from "react";
import { toast } from "sonner";
import { getEcho } from "@/lib/echo";

export default function useLibraryNotifications(
  userId?: string | number,
  onNotification?: () => void,
) {
  const normalizedUserId = useMemo(() => {
    if (typeof userId === "string") {
      const parsed = Number(userId);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    return userId;
  }, [userId]);

  const isReady = !!normalizedUserId;

  // Siempre el callback más reciente sin volverlo dependencia del efecto: si
  // quien llama lo pasa inline, no se debe dejar y volver a entrar al canal en
  // cada render (se perderían avisos en el hueco).
  const notify = useEffectEvent(() => onNotification?.());

  useEffect(() => {
    if (!isReady || !normalizedUserId) return;

    const echoInstance = getEcho();

    if (!echoInstance) return;

    const channelName = `library-notification.${normalizedUserId}`;

    const channel = echoInstance.private(channelName);

    const handler = (event: any) => {
      const status = event.status === "approved" ? "aprobada" : "rechazada";

      const message = `Notificación: ${event.message || `Solicitud ${status}`}`;

      // Una solicitud rechazada no es una buena noticia: no se pinta de éxito.
      if (event.status === "approved") toast.success(message);
      else toast.warning(message);

      notify();
    };

    // Solicitud nueva de enlace de carpeta: le llega a quien puede aprobarla.
    const folderShareHandler = (event: any) => {
      toast.info(
        event.message || "Hay una solicitud nueva de enlace de carpeta",
      );

      notify();
    };

    channel.listen(".share-request.reviewed", handler);
    channel.listen(".folder-share.requested", folderShareHandler);

    return () => {
      channel.stopListening(".share-request.reviewed");
      channel.stopListening(".folder-share.requested");

      echoInstance.leave(channelName);
    };
  }, [isReady, normalizedUserId]);
}
