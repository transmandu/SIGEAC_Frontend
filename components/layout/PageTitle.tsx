"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePageTitle } from "@/contexts/PageTitleContext";

const EASE = [0.22, 1, 0.36, 1] as const;

const RETRACT_MS = 220;
/** Mínimo que el loader permanece visible: menos que esto parece un glitch. */
const LOADER_MS = 280;

/**
 * El ContentLayout saliente desregistra su título antes de que el entrante
 * registre el suyo, así que el context pasa por "" en cada navegación. Ese
 * hueco es lo que se muestra como fase de carga, en vez de ocultarlo.
 */
export function PageTitle({ className }: { className?: string }) {
  const { title } = usePageTitle();
  const reduceMotion = useReducedMotion();

  const [shown, setShown] = useState(title);
  const [loading, setLoading] = useState(false);

  // El efecto solo reacciona al título; las fases se agendan de una vez.
  const shownRef = useRef(shown);
  shownRef.current = shown;

  // Instante en que el loader se hizo visible, para respetar su mínimo.
  const loaderAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const after = (ms: number, fn: () => void) =>
      timers.current.push(setTimeout(fn, ms));

    if (title === shownRef.current && !loading) return;

    clear();

    // El "" de una navegación es transitorio y el título saliente sigue montado
    // para recogerse; pero si la página de destino no publica ninguno, hay que
    // vaciar igual o el loader se queda girando para siempre.
    const settle = () => {
      setShown(title);
      setLoading(false);
    };

    // Primera pintura o motion reducido: sin secuencia.
    if ((!shownRef.current && title) || reduceMotion) {
      settle();
      return clear;
    }

    // Si el loader ya está en pantalla solo falta cumplir su mínimo.
    if (loading) {
      after(Math.max(0, LOADER_MS - (Date.now() - loaderAt.current)), settle);
      return clear;
    }

    // Recoger a la izquierda, mostrar el loader, desplegar el nuevo.
    after(RETRACT_MS, () => {
      loaderAt.current = Date.now();
      setLoading(true);
    });
    after(RETRACT_MS + LOADER_MS, settle);

    return clear;
  }, [title, loading, reduceMotion]);

  const showTitle = !!shown && !loading;

  return (
    <div
      className={cn(
        "relative hidden md:grid isolate items-center",
        "h-5 max-w-[220px] lg:max-w-[320px]",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showTitle ? (
          <motion.h1
            key={shown}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scaleX: 0.45, x: -6, filter: "blur(3px)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, scaleX: 1, x: 0, filter: "blur(0px)" }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scaleX: 0.45, x: -6, filter: "blur(3px)" }
            }
            transition={{
              duration: reduceMotion ? 0.12 : RETRACT_MS / 1000,
              ease: EASE,
            }}
            className={cn(
              "[grid-area:1/1]",
              "text-xs sm:text-sm font-bold truncate",
              "origin-left will-change-transform"
            )}
          >
            {shown}
          </motion.h1>
        ) : loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="[grid-area:1/1] flex items-center gap-1 origin-left"
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-foreground/45"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
                transition={{
                  duration: 0.75,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
