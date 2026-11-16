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

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const busyRef = React.useRef(false);

  // El tema nuevo se revela como un círculo que crece desde el botón (View
  // Transitions API, ver globals.css). Cambia de golpe solo si el navegador no
  // la soporta o el usuario pidió reducir el movimiento.
  const toggleTheme = () => {
    if (busyRef.current) return;

    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const button = buttonRef.current;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
        finished: Promise<void>;
      };
    };

    const canAnimate =
      !!button &&
      typeof doc.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    busyRef.current = true;
    root.classList.add("theme-switching");

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(safety);
      setTheme(next);
      busyRef.current = false;
      // Un fotograma después, para que el retorno de las transiciones no
      // anime el cambio recién hecho.
      requestAnimationFrame(() => root.classList.remove("theme-switching"));
    };
    // Si la transición nunca resuelve (pestaña en segundo plano) no se queda
    // bloqueado el botón.
    const safety = window.setTimeout(finish, 1000);

    const apply = () => {
      // Solo clase y color-scheme: es barato y es lo que la captura necesita.
      // El estado de next-themes se sincroniza al terminar.
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
    };

    if (!canAnimate || !button) {
      apply();
      finish();
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    try {
      const transition = doc.startViewTransition!.call(doc, apply);

      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 420,
              easing: "cubic-bezier(0.33, 1, 0.68, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});

      transition.finished.then(finish, finish);
    } catch {
      apply();
      finish();
    }
  };

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              "glass-control",
              "relative flex items-center justify-center",
              "size-9 rounded-full",
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
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.75,
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute"
                    >
                      <SunMedium className="size-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.75,
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        rotate: -90,
                        scale: 0.75,
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute"
                    >
                      <MoonStar className="size-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <span className="size-4" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </TooltipTrigger>

        <TooltipContent side="bottom">Cambiar tema</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
