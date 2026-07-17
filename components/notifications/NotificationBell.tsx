'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Bell,
  BellRing,
} from 'lucide-react';

import {
  AnimatePresence,
  motion,
} from 'motion/react';

import { cn } from '@/lib/utils';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useNotificationEffects } from '@/hooks/sistema/useNotificationEffects';
import { useAuth } from '@/contexts/AuthContext';

import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();

  const { notifications, unreadCount } =
    useNotifications(
      selectedCompany?.slug,
      user?.id
    );

  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const previousCount = useRef(unreadCount);

  useNotificationEffects({
    notifications,
    unreadCount,
    open,
    scopeKey: selectedCompany?.slug,
  });

  useEffect(() => {
    if (unreadCount > previousCount.current) {
      setShake(true);

      const timeout = setTimeout(() => {
        setShake(false);
      }, 700);

      return () => clearTimeout(timeout);
    }

    previousCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              aria-label="Notifications"
              className={cn(
                'relative flex items-center justify-center',
                'h-9 w-9 rounded-full',
                'bg-background',
                'border border-border/80',
                'text-foreground/90',
                'hover:text-foreground',
                'hover:bg-muted/70',
                'hover:border-border',
                'transition-all duration-200',
                'active:scale-95',
                open && 'bg-muted/60'
              )}
            >
              <motion.div
                animate={
                  shake
                    ? {
                        rotate: [0, -12, 12, -10, 10, -6, 6, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut',
                }}
              >
                {unreadCount > 0 ? (
                  <BellRing className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </motion.div>

              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{
                      scale: 0.6,
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      scale: 0.6,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="
                      absolute -top-1 -right-1
                      min-w-4 h-4 px-1
                      flex items-center justify-center
                      rounded-full
                      bg-red-500 text-white
                      text-[10px] font-medium
                      shadow-sm
                    "
                  >
                    {unreadCount > 9 ? '+9' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="z-[1001]">
            Notificaciones
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}