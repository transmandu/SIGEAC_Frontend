"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Inbox, CheckCheck, X } from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import {
  useClearAllNotifications,
  useClearReadNotifications,
  useMarkAllNotificationsAsRead,
} from "@/actions/notifications/actions";
import { useHideReadNotifications } from "@/hooks/helpers/use-hide-read-notifications";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useAuth } from "@/contexts/AuthContext";
import NotificationItem from "./NotificationItem";
import Link from "next/link";
import { canClearNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();

  const canClear = canClearNotifications(user?.roles);

  // Eliminar no se deshace: el primer toque arma el botón y el segundo lo
  // ejecuta. Si no se confirma en unos segundos, se desarma solo.
  const [armed, setArmed] = useState<"read" | "all" | null>(null);

  useEffect(() => {
    if (!armed) return;

    const timeout = setTimeout(() => setArmed(null), 3000);

    return () => clearTimeout(timeout);
  }, [armed]);

  const { notifications, unreadCount } = useNotifications(
    selectedCompany?.slug,
  );

  const { hideRead, setHideRead } = useHideReadNotifications();

  const visibleNotifications = hideRead
    ? notifications.filter((notification) => !notification.read_at)
    : notifications;

  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead(
    selectedCompany?.slug!,
  );

  const { mutate: clearRead, isPending: isClearingRead } =
    useClearReadNotifications(selectedCompany?.slug!);

  const { mutate: clearAll, isPending: isClearingAll } =
    useClearAllNotifications(selectedCompany?.slug!);

  if (typeof window === "undefined") {
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
            className="fixed inset-0 z-999 bg-black/40"
          />

          {/* PANEL */}

          <motion.aside
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 32,
            }}
            className="fixed right-0 top-0 bottom-0 z-1000 w-full sm:w-105 border-l bg-background shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col"
          >
            {/* HEADER */}
            <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm px-5 py-4">
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

                              <span className="absolute bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-border/50 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>

                      <TooltipContent
                        side="right"
                        align="center"
                        sideOffset={8}
                        className="z-1001"
                      >
                        Ir al panel
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {unreadCount} sin leer
                  </p>

                  <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer w-fit">
                    <Checkbox
                      checked={hideRead}
                      onCheckedChange={(checked) =>
                        setHideRead(checked === true)
                      }
                    />
                    Ocultar leídas
                  </label>
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                          >
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          </button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom" className="z-1001">
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

                      <TooltipContent side="bottom" className="z-1001">
                        Cerrar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto scrollbar-modern">
              {visibleNotifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />

                  <h3 className="text-sm font-medium">Sin notificaciones</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {hideRead && notifications.length > 0
                      ? "No hay notificaciones sin leer."
                      : "Todo está al día."}
                  </p>
                </div>
              ) : (
                <div className="p-2 gap-2 flex flex-col">
                  {visibleNotifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* FOOTER */}

            {canClear && (
              <div className="border-t bg-background/80 backdrop-blur-sm px-4 py-3">
                <div className="flex items-center justify-center gap-6">
                  {/* VACÍAR LEÍDAS */}
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (armed === "read") {
                              clearRead();
                              setArmed(null);
                            } else {
                              setArmed("read");
                            }
                          }}
                          disabled={isClearingRead}
                          aria-label="Eliminar leídas"
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-orange-500/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
                            armed === "read" &&
                              "border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/15 hover:text-red-600",
                          )}
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" className="z-1001">
                        {armed === "read"
                          ? "Pulse de nuevo para confirmar"
                          : "Eliminar leídas"}
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
                          onClick={() => {
                            if (armed === "all") {
                              clearAll();
                              setArmed(null);
                            } else {
                              setArmed("all");
                            }
                          }}
                          disabled={isClearingAll}
                          aria-label="Eliminar todo"
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-red-500/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
                            armed === "all" &&
                              "border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/15 hover:text-red-600",
                          )}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent side="top" className="z-1001">
                        {armed === "all"
                          ? "Pulse de nuevo para confirmar"
                          : "Eliminar todo"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Al tocar no hay tooltip: el aviso va escrito, a la vista. */}
                {armed && (
                  <p className="mt-2 text-center text-[11px] text-red-600/90">
                    Pulse de nuevo para confirmar
                  </p>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
