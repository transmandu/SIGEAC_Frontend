'use client';

import { useEffect } from 'react';
import useEcho from './echo/useEcho';
import { toast } from 'sonner';

export default function useLibraryNotifications(
  userId: number | undefined,
  onNotification?: () => void
) {
  const echo = useEcho();

  useEffect(() => {
    if (!echo || !userId) return;

    const channel = echo.private(`library-notification.${userId}`);

    channel.listen('.share-request.reviewed', (e: any) => {
      const status = e.status === 'approved' ? 'aprobada' : 'rechazada';
      toast.success(`Notificación: ${e.message || `Solicitud ${status}`}`);
      onNotification?.();
    });

    return () => {
      channel.stopListening('.share-request.reviewed');
      echo.leave(`library-notification.${userId}`);
    };
  }, [echo, userId, onNotification]);
}
