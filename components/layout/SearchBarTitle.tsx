"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { usePageTitle } from "@/contexts/PageTitleContext";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * El ContentLayout saliente desregistra su título antes de que el entrante
 * registre el suyo, así que el contexto pasa por "" en cada navegación. Ese
 * hueco casi nunca dura: el título anterior se conserva y se cruza directo con
 * el nuevo. Solo si se alarga se muestran los puntos de carga.
 */
const LOADER_DELAY_MS = 350;
/** Techo del hueco antes de aceptar que la página no publicará título. */
const GAP_MS = 1200;

export const SEARCH_HINT = "Buscar un acceso rápido…";

/** El título de la página hace de placeholder de la barra de búsqueda. */
export function SearchBarTitle() {
  const { title } = usePageTitle();
  const reduceMotion = useReducedMotion();

  const [shown, setShown] = useState(title);
  const [loading, setLoading] = useState(false);

  if (title !== "") {
    if (title !== shown) setShown(title);
    if (loading) setLoading(false);
  }

  useEffect(() => {
    if (title !== "" || shown === "") return;

    const toLoader = setTimeout(() => setLoading(true), LOADER_DELAY_MS);
    const toSettle = setTimeout(() => {
      setLoading(false);
      setShown("");
    }, GAP_MS);

    return () => {
      clearTimeout(toLoader);
      clearTimeout(toSettle);
    };
  }, [title, shown]);

  const hasContent = shown !== "" || loading;

  return (
    <span className="grid min-w-0 flex-1 items-center">
      <span className="grid min-w-0 items-center transition-opacity duration-200 [grid-area:1/1] group-focus-visible:opacity-0 pointer-fine:group-hover:opacity-0">
        <AnimatePresence initial={false}>
          {loading ? (
            <motion.span
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: EASE }}
              className="flex items-center gap-1 [grid-area:1/1]"
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1 rounded-full bg-foreground/45"
                  animate={
                    reduceMotion
                      ? undefined
                      : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }
                  }
                  transition={{
                    duration: 0.75,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                />
              ))}
            </motion.span>
          ) : shown ? (
            <motion.span
              key={shown}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: -8,
                      clipPath: "inset(-4px 100% -4px 0%)",
                    }
              }
              animate={
                reduceMotion
                  ? { opacity: 1, transition: { duration: 0.12 } }
                  : {
                      opacity: 1,
                      x: 0,
                      clipPath: "inset(-4px 0% -4px 0%)",
                      transition: { duration: 0.26, ease: EASE, delay: 0.05 },
                    }
              }
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0.1 } }
                  : {
                      opacity: 0,
                      x: -6,
                      transition: { duration: 0.14, ease: "easeIn" },
                    }
              }
              className="truncate text-sm text-slate-700 [grid-area:1/1] dark:text-slate-200"
            >
              {shown}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>

      <span
        aria-hidden
        className={cn(
          "truncate text-sm text-muted-foreground opacity-0 transition-opacity duration-200 [grid-area:1/1] group-focus-visible:opacity-100 pointer-fine:group-hover:opacity-100",
          !hasContent && "opacity-100",
        )}
      >
        {SEARCH_HINT}
      </span>
    </span>
  );
}
