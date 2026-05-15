'use client';

import { Notification } from '@/types/notifications/types';
import { cn } from '@/lib/utils';
import { Bell, Circle, Check } from 'lucide-react';

import { useCompanyStore } from '@/stores/CompanyStore';
import { useMarkNotificationAsRead } from '@/hooks/notifications/useMarkNotificationAsRead';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { selectedCompany } = useCompanyStore();

  const { mutate: markAsRead, isPending } =
    useMarkNotificationAsRead(selectedCompany?.slug!);

  const isUnread = !notification.read_at;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread && !isPending) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-3 py-2 cursor-pointer transition-all',
        'rounded-xl mx-1',
        'bg-muted/20 hover:bg-muted/40',
        'border border-transparent hover:border-border/30',
        'shadow-sm',
        'overflow-hidden'
      )}
    >
    {/* ACTION + GRADIENT BACKDROP */}
    {isUnread && (
    <div
        className="
        absolute right-0 top-0 h-full w-20 overflow-visible

        flex items-center justify-center

        opacity-0 scale-95 translate-x-2
        group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0

        transition-all duration-200 ease-out
        "
    >
        {/* GRADIENT BACKDROP */}
        <div
        className="
            absolute inset-0
            bg-gradient-to-l from-black/30 via-black/10 to-transparent
            pointer-events-none

            rounded-r-xl
        "
        />

        <TooltipProvider delayDuration={100}>
        <Tooltip>
            <TooltipTrigger asChild>
            <button
                onClick={handleMarkAsRead}
                disabled={isPending}
                className="
                relative z-10

                flex items-center justify-center
                w-8 h-8

                rounded-md
                bg-background/70 backdrop-blur-md
                border border-border/40
                shadow-sm

                hover:bg-background
                active:scale-95

                transition
                "
            >
                <Check className="w-4 h-4 text-green-600" />
            </button>
            </TooltipTrigger>

            <TooltipContent side="left">
            Marcar como leído
            </TooltipContent>
        </Tooltip>
        </TooltipProvider>
    </div>
    )}

      {/* ICON */}
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isUnread
              ? 'bg-blue-500/10 text-blue-600'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <Bell className="w-4 h-4" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-w-0">

        {/* TITLE */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isUnread ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {notification.data.title}
          </p>

          {isUnread && (
            <Circle className="w-2 h-2 fill-blue-500 text-blue-500 mt-1" />
          )}

          {!isUnread && (
            <Check className="w-3 h-3 text-green-500 mt-1" />
          )}
        </div>

        {/* MESSAGE */}
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.data.message}
        </p>

        {/* FOOTER */}
        <div className="mt-1 flex items-center justify-between">
          {isUnread ? (
            <span className="text-[10px] text-blue-600 font-medium">
              Nueva
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Leída
            </span>
          )}
        </div>
      </div>
    </div>
  );
}