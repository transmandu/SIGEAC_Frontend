'use client';

import { useEffect, useRef } from 'react';

type Notification = {
  id: string;
};

interface Params {
  notifications: Notification[];
  unreadCount: number;
  open?: boolean;
}

export function useNotificationEffects({
  notifications,
  unreadCount,
  open = false,
}: Params) {
  const prevIdsRef = useRef<string[]>([]);
  const prevUnreadRef = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseTitleRef = useRef<string>('');
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // init audio + base title
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    baseTitleRef.current = document.title;
  }, []);

  const setBurstTitle = (count: number) => {
    const label =
      count === 1
        ? 'Nueva notificación'
        : 'Nuevas notificaciones';

    document.title = `(${count}) ${label} - SIGEAC`;

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    titleTimeoutRef.current = setTimeout(() => {
      document.title =
        count > 0
          ? `(${count}) - SIGEAC`
          : baseTitleRef.current;
    }, 4000);
  };

  useEffect(() => {
    const currentIds = notifications?.map(n => n.id) ?? [];

    const hasNew =
      currentIds.some(id => !prevIdsRef.current.includes(id));

    const unreadIncreased = unreadCount > prevUnreadRef.current;

    const shouldTrigger = hasNew && unreadIncreased;

    // 🔊 sonido
    if (shouldTrigger) {
      audioRef.current?.play().catch(err => {
        console.warn('Audio blocked:', err);
      });
    }

    // 🧠 título
    if (!open) {
      if (shouldTrigger) {
        setBurstTitle(unreadCount);
      } else {
        document.title =
          unreadCount > 0
            ? `(${unreadCount}) - SIGEAC`
            : baseTitleRef.current;
      }
    }

    prevIdsRef.current = currentIds;
    prevUnreadRef.current = unreadCount;
  }, [notifications, unreadCount, open]);
}