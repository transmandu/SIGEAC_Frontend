"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePageTitle } from "@/contexts/PageTitleContext";

const EASE = [0.22, 1, 0.36, 1] as const;

const RETRACT_MS = 220;
/** Mínimo que el loader permanece visible: menos que esto parece un glitch. */
const LOADER_MS = 280;
/** Techo del hueco entre páginas antes de aceptar que no habrá título. */
const GAP_MS = 1200;

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

  // `shown` es salida de la secuencia, no entrada: el efecto depende solo del
  // título para que cada cambio ejecute UNA secuencia completa. Si dependiera
  // también de `shown`/`loading`, sus propios setState lo reentrarían a mitad
  // de camino y tendría que cancelar y re-agendar los timers que acaba de
  // poner, recalculando la ventana del loader sobre un instante ya vencido.
  const shownRef = useRef(shown);

  useEffect(() => {
    const settle = (next: string) => {
      shownRef.current = next;
      setShown(next);
      setLoading(false);
    };

    // El título vuelve a ser el que ya mostrábamos: un remount del mismo
    // ContentLayout (F5, refetch) que pasó por "" y regresó. No hay secuencia
    // que correr, pero si el hueco alcanzó a encender el loader hay que
    // apagarlo: si no, nadie más lo hará y se queda girando para siempre.
    if (title === shownRef.current) {
      setLoading(false);
      return;
    }

    // Primera pintura o motion reducido: sin secuencia intermedia.
    if (!shownRef.current || reduceMotion) {
      settle(title);
      return;
    }

    // Recoger a la izquierda y mostrar el loader. Ambos timers son de la misma
    // pasada, así que el loader vive LOADER_MS exactos sin medir nada.
    const toLoader = setTimeout(() => setLoading(true), RETRACT_MS);

    // El "" entre dos páginas es el hueco de la navegación, no un destino: el
    // loader se queda esperando al título entrante en vez de vaciar y volver a
    // llenarse. Pero una página puede no publicar ninguno (no usa
    // ContentLayout), así que el hueco tiene techo: pasado GAP_MS se acepta
    // como vacío real y el loader cede.
    const toSettle = setTimeout(
      () => settle(title),
      title ? RETRACT_MS + LOADER_MS : GAP_MS,
    );

    return () => {
      clearTimeout(toLoader);
      clearTimeout(toSettle);
    };
  }, [title, reduceMotion]);

  const showTitle = !!shown && !loading;

  return (
    <div
      className={cn(
        "relative hidden md:grid isolate items-center",
        "h-5 max-w-55 lg:max-w-[320px]",
        className,
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
              "origin-left will-change-transform",
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
                animate={{
                  opacity: [0.25, 1, 0.25],
                  scale: [0.85, 1.15, 0.85],
                }}
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
