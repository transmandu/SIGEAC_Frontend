"use client";

import { useEffect, useRef, useState } from "react";

import { Bell, BellRing } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useNotificationEffects } from "@/hooks/sistema/useNotificationEffects";
import { useAuth } from "@/contexts/AuthContext";

import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();

  const { notifications, unreadCount } = useNotifications(
    selectedCompany?.slug,
    user?.id,
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

  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (unreadCount > previousCount.current) {
      setShake(true);
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      shakeTimeout.current = setTimeout(() => setShake(false), 700);
    }

    previousCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(
    () => () => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    },
    [],
  );

  return (
    <>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <motion.button
              initial="rest"
              whileHover="hover"
              onClick={() => setOpen(true)}
              aria-label="Notificaciones"
              className={cn(
                "glass-control",
                "relative flex items-center justify-center",
                "size-9 rounded-full",
                "border",
                "text-foreground/90",
                "hover:text-foreground",
                "active:scale-95",
                open && "bg-muted/60",
              )}
            >
              <motion.span
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { scale: 1.12, rotate: -8 },
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex"
              >
                <motion.span
                  animate={{
                    rotate: shake ? [0, -12, 12, -10, 10, -6, 6, 0] : 0,
                  }}
                  transition={{
                    duration: shake ? 0.6 : 0.2,
                    ease: "easeInOut",
                  }}
                  className="flex"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="size-4" />
                  ) : (
                    <Bell className="size-4" />
                  )}
                </motion.span>
              </motion.span>

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
                      shadow-xs
                    "
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="z-1001">
            Notificaciones
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
