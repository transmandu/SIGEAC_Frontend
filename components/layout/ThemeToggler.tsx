"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { SunMedium, MoonStar } from "lucide-react";

const noopSubscribe = () => () => {};

export function ThemeToggler() {
  const { setTheme, resolvedTheme } = useTheme();

  // El tema resuelto solo se conoce en el cliente (localStorage/media query).
  // El snapshot del servidor es false y el del cliente true, así que el primer
  // render coincide con el HTML y luego se muestra el icono correcto.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              "glass-control",
              "relative flex items-center justify-center",
              "h-9 w-9 rounded-full",
              "border",
              "text-foreground/90",
              "hover:text-foreground",
              "active:scale-95",
            )}
          >
            <motion.div
              whileHover={{ scale: 1.12, rotate: -8 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {mounted ? (
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{
                        opacity: 0,
                        rotate: -90,
                        scale: 0.75,
                        filter: "blur(2px)",
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.75,
                        filter: "blur(2px)",
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute"
                    >
                      <SunMedium className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.75,
                        filter: "blur(2px)",
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        rotate: -90,
                        scale: 0.75,
                        filter: "blur(2px)",
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute"
                    >
                      <MoonStar className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <span className="h-4 w-4" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </TooltipTrigger>

        <TooltipContent side="bottom">Cambiar tema</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
