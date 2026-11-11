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

  // El nuevo tema se revela como un círculo que crece desde el botón (View
  // Transitions API). Cambia de golpe, sin animación, si el navegador no la
  // soporta, si el usuario pidió reducir el movimiento o si el equipo es de
  // pocos núcleos (la captura de toda la pantalla con blur es lo que pesa).
  const toggleTheme = () => {
    // Un segundo clic mientras corre el círculo invertiría el tema a mitad de
    // la animación; se ignora hasta que termine.
    if (busyRef.current) return;

    const next = isDark ? "light" : "dark";
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
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      (navigator.hardwareConcurrency ?? 4) > 2;

    if (!canAnimate || !button) {
      setTheme(next);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    busyRef.current = true;
    const release = () => {
      busyRef.current = false;
    };
    // Red de seguridad: si la transición nunca resuelve (pestaña en segundo
    // plano, error del navegador) el botón no queda bloqueado.
    const safety = window.setTimeout(release, 1500);

    try {
      const transition = doc.startViewTransition!.call(doc, () => {
        // Solo se cambia el DOM (clase + color-scheme): es lo único que la
        // captura necesita y es barato. Re-renderizar React aquí con flushSync
        // congelaba la pantalla unos cientos de ms antes de que empezara la
        // animación, que era la sensación de pesadez. El estado de next-themes
        // se sincroniza al terminar.
        const root = document.documentElement;
        root.classList.toggle("dark", next === "dark");
        root.style.colorScheme = next;
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              // El opacity parcial suaviza el borde del círculo: el tema nuevo
              // entra "mezclándose" con el viejo en vez de cortarlo en seco.
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
              opacity: [0.25, 1],
            },
            {
              duration: 480,
              easing: "cubic-bezier(0.33, 1, 0.68, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});

      transition.finished
        .catch(() => {})
        .finally(() => {
          window.clearTimeout(safety);
          setTheme(next);
          release();
        });
    } catch {
      window.clearTimeout(safety);
      release();
      setTheme(next);
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
                      <SunMedium className="size-4" />
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
