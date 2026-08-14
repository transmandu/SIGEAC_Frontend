"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Avión y check en los dos extremos de la sesión: entrar termina en el check,
 * salir empieza en él. La transición entre ambos es un fundido corto — se probó
 * a interpolar los contornos punto a punto y las figuras intermedias no se leen
 * como ninguna de las dos.
 *
 * El avión vuela fuera del cuadro del ícono, así que ni el SVG ni sus
 * contenedores pueden recortar: de ahí el `overflow-visible` en el wrapper y en
 * el propio svg de lucide.
 */

export type PlaneCheckPhase = "traveling" | "arrived";

interface PlaneCheckMorphProps {
  /** "traveling" muestra el avión; "arrived" el check dentro de su círculo. */
  phase: PlaneCheckPhase;
  /** "arrival" llega y se posa; "departure" despega una vez y se va. */
  direction: "arrival" | "departure";
  className?: string;
}

const PlaneCheckMorph = ({
  phase,
  direction,
  className,
}: PlaneCheckMorphProps) => {
  const reduceMotion = useReducedMotion();

  const isArrived = phase === "arrived";

  // El avión de lucide apunta al noreste, así que su eje de vuelo natural es la
  // diagonal: llega desde abajo-izquierda y se va hacia arriba-derecha.
  const flight = reduceMotion
    ? { x: 0, y: 0, rotate: 0, opacity: 1 }
    : direction === "arrival"
      ? { x: [-30, 0], y: [22, 0], rotate: [-8, 0], opacity: [0, 1] }
      : { x: [0, 8, 52], y: [0, -6, -38], rotate: [0, 3, 10], opacity: [1, 1, 0] };

  const flightTransition = reduceMotion
    ? { duration: 0.2 }
    : direction === "arrival"
      ? { duration: 0.95, ease: "easeOut" as const }
      : {
          // Sin repeat: el despegue ocurre una vez y el avión no vuelve.
          duration: 1.2,
          times: [0, 0.3, 1],
          ease: "easeIn" as const,
        };

  return (
    <div
      className={cn(
        "relative flex size-10 items-center justify-center overflow-visible",
        className,
      )}
    >
      {/* Halo con tamaño propio y centrado por transform, para que no lo
          arrastre el avión al desplazarse. */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-xl"
        animate={
          reduceMotion
            ? { opacity: 0.35 }
            : { opacity: [0.2, 0.5, 0.2], scale: [1.15, 1.4, 1.15] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* AVIÓN */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-visible text-primary"
        initial={false}
        animate={
          isArrived
            ? { opacity: 0, scale: 0.8 }
            : { scale: 1, ...flight }
        }
        transition={
          isArrived
            ? { duration: 0.2, ease: "easeIn" }
            : {
                x: flightTransition,
                y: flightTransition,
                rotate: flightTransition,
                opacity: flightTransition,
                scale: { duration: 0.2 },
              }
        }
      >
        <Plane className="size-10 overflow-visible" />
      </motion.div>

      {/* CHECK EN SU CÍRCULO: el círculo se dibuja y luego se traza la marca,
          para que la llegada cierre con un gesto y no con un corte seco. */}
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute size-10 text-primary"
        initial={false}
        animate={{ opacity: isArrived ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.25, ease: "easeOut" }}
        aria-hidden
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          initial={false}
          animate={{ pathLength: isArrived ? 1 : 0 }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.4,
            delay: isArrived && !reduceMotion ? 0.05 : 0,
            ease: "easeOut",
          }}
        />

        <motion.path
          d="M8 12.5l2.5 2.5 5.5-6"
          initial={false}
          animate={{ pathLength: isArrived ? 1 : 0 }}
          transition={{
            duration: reduceMotion ? 0.15 : 0.28,
            delay: isArrived && !reduceMotion ? 0.3 : 0,
            ease: "easeOut",
          }}
        />
      </motion.svg>
    </div>
  );
};

export default PlaneCheckMorph;
