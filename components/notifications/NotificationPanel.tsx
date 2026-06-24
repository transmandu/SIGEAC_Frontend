'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Inbox, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useMarkAllNotificationsAsRead } from '@/hooks/notifications/useMarkAllNotificationsAsRead';
import { useClearAllNotifications } from '@/hooks/notifications/useClearAllNotifications';
import { useClearReadNotifications } from '@/hooks/notifications/useClearReadNotifications';
import { useCompanyStore } from '@/stores/CompanyStore';
import NotificationItem from './NotificationItem';
import Link from 'next/link';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  open,
  onClose,
}: Props) {
  const { selectedCompany } = useCompanyStore();

  const { notifications, unreadCount } =
    useNotifications(selectedCompany?.slug);

  const { mutate: markAllAsRead, isPending } =
    useMarkAllNotificationsAsRead(
      selectedCompany?.slug!
    );

  const { mutate: clearRead, isPending: isClearingRead } =
    useClearReadNotifications(selectedCompany?.slug!);

  const { mutate: clearAll, isPending: isClearingAll } =
    useClearAllNotifications(selectedCompany?.slug!);

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
            }}
            onClick={onClose}
            className="fixed inset-0 z-[999] bg-black/40"
          />

          {/* PANEL */}

          <motion.aside
            initial={{
              x: '100%',
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: '100%',
            }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 32,
            }}
            className="fixed right-0 top-0 bottom-0 z-[1000] w-full sm:w-[420px] border-l bg-background shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col"
          >
            {/* HEADER */}
            <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur px-5 py-4">
              <div className="flex items-start justify-between">

                {/* LEFT */}
                <div>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/${selectedCompany?.slug}/notifications`}
                          onClick={onClose}
                          className="group"
                        >
                          <div className="flex items-center gap-2">
                            <Inbox className="h-4 w-4" />

                            <div className="relative">
                              <h2 className="text-sm font-semibold leading-none">
                                Notificaciones
                              </h2>

                              <span className="absolute -bottom-[2px] left-0 h-px w-full origin-left scale-x-0 bg-border/50 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>

                      <TooltipContent side="right" align="center" sideOffset={8}>
                        Ir al panel
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {unreadCount} sin leer
                  </p>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-1">

                  {/* MARCAR TODO COMO LEÍDO */}
                  {unreadCount > 0 && (
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => markAllAsRead()}
                            disabled={isPending}
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted disabled:opacity-50"
                          >
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          </button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                          Marcar todas como leídas
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* CERRAR */}
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={onClose}
                          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="bottom">
                        Cerrar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto scrollbar-modern">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <Inbox className="mb-4 h-12 w-12text-muted-foreground/50"/>

                  <h3 className="text-sm font-medium">
                    Sin notificaciones
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Todo está al día.
                  </p>
                </div>
              ) : (
                <div className="p-2 gap-2 flex flex-col">
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* FOOTER */}

            <div className="border-t bg-background/80 backdrop-blur px-4 py-3">
              <div className="flex items-center justify-center gap-6">

                {/* VACÍAR LEÍDAS */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => clearRead()}
                        disabled={isClearingRead}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-orange-500/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      Vaciar leídas
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* DIVIDER */}
                <span className="h-5 w-px bg-border/60" />

                {/* VACÍAR TODO */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => clearAll()}
                        disabled={isClearingAll}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      Vaciar todo
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}