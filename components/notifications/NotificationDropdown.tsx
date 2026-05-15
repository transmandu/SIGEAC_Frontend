'use client';

import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';
import NotificationItem from './NotificationItem';
import { useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Inbox, CheckCheck } from 'lucide-react';

import { useMarkAllNotificationsAsRead } from '@/hooks/notifications/useMarkAllNotificationsAsRead';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  onClose?: () => void;
}

export default function NotificationDropdown({ onClose }: Props) {
  const { selectedCompany } = useCompanyStore();

  const { notifications, unreadCount } = useNotifications(
    selectedCompany?.slug
  );

  const { mutate: markAllAsRead, isPending } =
    useMarkAllNotificationsAsRead(selectedCompany?.slug!);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      {/* overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* container */}
      <div ref={dropdownRef} className="absolute right-0 mt-2 w-96 rounded-xl border bg-background shadow-2xl z-50 overflow-visible">

        {/* HEADER */}

        <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-muted/40 backdrop-blur rounded-t-xl">

          {/* LEFT INFO */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Notificaciones
            </h3>

            <p className="text-xs text-muted-foreground">
              {unreadCount} sin leer
            </p>
          </div>

          {/* RIGHT ACTION (ICON + TOOLTIP) */}
          {unreadCount > 0 && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => markAllAsRead()}
                    disabled={isPending}
                    className="
                      p-2 rounded-md
                      hover:bg-muted
                      transition-colors
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    <CheckCheck className="w-4 h-4 text-blue-600" />
                  </button>
                </TooltipTrigger>

                <TooltipContent side="bottom" className="z-[999]">
                Marcar todas como leídas
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Separator />

        {/* CONTENT */}
          <div
            className={`scrollbar-modern transition-colors relative z-10 ${
              notifications.length > 0
                ? 'max-h-[180px] overflow-y-auto bg-muted/40'
                : ''
            }`}
          >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Sin notificaciones</p>
              <p className="text-xs text-muted-foreground">Todo está al día</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 py-1">
              {notifications.map(n => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}