'use client';

import { Notification } from '@/types/notifications/types';
import { cn } from '@/lib/utils';
import { Clock, CheckCheck } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Check, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useMarkNotificationAsRead } from '@/hooks/notifications/useMarkNotificationAsRead';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ITEM_COLORS = [
  {
    stripe: 'bg-blue-500/60',
    border: 'border-blue-400/25',
    hover: 'group-hover:border-blue-400/45',
  },
  {
    stripe: 'bg-emerald-500/60',
    border: 'border-emerald-400/25',
    hover: 'group-hover:border-emerald-400/45',
  },
  {
    stripe: 'bg-orange-500/60',
    border: 'border-orange-400/25',
    hover: 'group-hover:border-orange-400/45',
  },
  {
    stripe: 'bg-indigo-500/60',
    border: 'border-indigo-400/25',
    hover: 'group-hover:border-indigo-400/45',
  },
  {
    stripe: 'bg-sky-500/60',
    border: 'border-sky-400/25',
    hover: 'group-hover:border-sky-400/45',
  },
  {
    stripe: 'bg-teal-500/60',
    border: 'border-teal-400/25',
    hover: 'group-hover:border-teal-400/45',
  },
  {
    stripe: 'bg-red-500/60',
    border: 'border-red-400/25',
    hover: 'group-hover:border-red-400/45',
  },
];

function getNotificationColors(id: string | number) {
  const hash = String(id)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return ITEM_COLORS[hash % ITEM_COLORS.length];
}

function NotificationIcon({ name }: { name?: string }) {
  const Icon = (LucideIcons as Record<string, any>)[name ?? 'Bell'] ?? Bell;

  return <Icon className="h-5 w-5" />;
}

function formatNotificationDate(date: string) {
  const value = formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });

  return value.replace(
    /hace alrededor de (\d+) (hora|horas|día|días|mes|meses|año|años)/,
    'hace $1 $2'
  );
}

export default function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const router = useRouter();

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

  const handleNavigate = () => {
    const url = notification.data?.url;
    if (!url) return;
    router.push(url);
  };

  const colors = getNotificationColors(notification.id);

  return (
    <div
      onClick={handleNavigate}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2',
        'mx-1 cursor-pointer overflow-hidden rounded-xl',
        'bg-muted/20 hover:bg-muted/40',
        'shadow-sm transition-all'
      )}
    >
    {/* COLOR STRIPE */}
    <div
      className={cn(
        'absolute left-0 top-0 h-full w-1',
        colors.stripe
      )}
    />

    {/* COLORED BORDER */}
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-xl border transition-all duration-200',
        colors.border,
        colors.hover
      )}
    />
      {/* ACTION + GRADIENT (desktop only) */}
      {isUnread && (
        <div
          className="
            hidden md:flex
            absolute right-0 top-0 h-full w-20 overflow-visible
            items-center justify-center

            opacity-0 scale-95 translate-x-2
            group-hover:opacity-100
            group-hover:scale-100
            group-hover:translate-x-0

            transition-all duration-200 ease-out
          "
        >
          <div
            className="
              absolute inset-0
              bg-gradient-to-l
              from-black/30
              via-black/10
              to-transparent
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
                    bg-background/70
                    backdrop-blur-md

                    border border-border/40
                    shadow-sm

                    hover:bg-background
                    active:scale-95

                    transition
                  "
                >
                  <Check className="h-4 w-4 text-green-600" />
                </button>
              </TooltipTrigger>

              <TooltipContent side="left" className="z-[1001]">
                Marcar como leído
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* ICON */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            isUnread
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <NotificationIcon
            name={notification.data.icon}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="min-w-0 flex-1">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <p
            className={cn(
              'truncate text-sm font-medium flex-1 min-w-0',
              isUnread
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {notification.data.title}
          </p>

          <span
            className={cn(
              'flex-shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium',
              isUnread
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isUnread ? 'Nueva' : 'Leída'}
          </span>
        </div>

        {/* MESSAGE */}
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.data.message}
        </p>

        {/* FOOTER */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
          {notification.created_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatNotificationDate(notification.created_at)}
            </span>
          )}

          {!isUnread && notification.read_at && (
            <>
              <span className="text-muted-foreground/40">·</span>

              <span className="flex items-center gap-1">
                <CheckCheck className="h-3 w-3 text-blue-500" />
                <span>
                  Leído {' '}
                  {formatNotificationDate(notification.read_at)}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}