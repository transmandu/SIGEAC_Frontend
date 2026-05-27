'use client';

import { useEffect } from 'react';
import echo from '@/lib/echo';
import { toast } from 'sonner';

export default function useLibraryNotifications(
  userId: number | undefined,
  onNotification?: () => void
) {
  useEffect(() => {
    if (!echo || !userId) return;

    const echoInstance = echo;

    const channel = echoInstance.private(
      `library-notification.${userId}`
    );

    channel.listen(
      '.share-request.reviewed',
      (e: any) => {
        const status =
          e.status === 'approved'
            ? 'aprobada'
            : 'rechazada';

        toast.success(
          `Notificación: ${
            e.message ||
            `Solicitud ${status}`
          }`
        );

        onNotification?.();
      }
    );

    return () => {
      channel.stopListening(
        '.share-request.reviewed'
      );

      echoInstance.leave(
        `private-library-notification.${userId}`
      );
    };
  }, [userId, onNotification]);
}