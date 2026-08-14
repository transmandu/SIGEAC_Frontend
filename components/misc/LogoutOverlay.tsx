"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import PlaneCheckMorph from "./PlaneCheckMorph";

/**
 * Pantalla de cierre de sesión. Arranca en el check —la sesión que estaba
 * abierta— y a los pocos milisegundos se vuelve avión y despega: el gesto
 * inverso al de la llegada en CompanyBootstrap.
 */
const LogoutOverlay = () => {
  const [departed, setDeparted] = useState(false);

  // El check se sostiene lo justo para leerse antes de desplegarse en avión;
  // sin la pausa el overlay abre con la transformación ya empezada.
  useEffect(() => {
    const timeout = window.setTimeout(() => setDeparted(true), 420);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <motion.div
        aria-hidden
        className="absolute size-[500px] max-w-[90vw] rounded-full bg-primary/10 blur-3xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
      />

      <div className="relative flex flex-col items-center gap-5">
        <PlaneCheckMorph
          phase={departed ? "traveling" : "arrived"}
          direction="departure"
        />

        <div className="space-y-1 text-center">
          <motion.p
            className="text-sm font-medium text-foreground"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Cerrando tu sesión
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            Asegurando tus datos...
          </motion.p>
        </div>

        <div className="relative h-1 w-44 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "250%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LogoutOverlay;
