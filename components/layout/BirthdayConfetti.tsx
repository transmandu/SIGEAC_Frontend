"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Confetti from "react-confetti";
import { toast } from "sonner";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMyBirthdayToday } from "@/hooks/sistema/usuario/useGetMyBirthdayToday";
import { useWindowSize } from "@/hooks/useWindowSize";

const SESSION_KEY = "sigeac_birthday_confetti_shown";
const DURATION_MS = 6000;

// El confeti dura un rato fijo desde que arranca, esté o no montado el
// componente; React solo lo lee.
const celebration = (() => {
  let active = false;
  const listeners = new Set<() => void>();
  const set = (value: boolean) => {
    active = value;
    listeners.forEach((notify) => notify());
  };

  return {
    subscribe: (notify: () => void) => {
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    },
    isActive: () => active,
    start: () => {
      set(true);
      setTimeout(() => set(false), DURATION_MS);
    },
  };
})();

/**
 * Saludo al usuario cuando entra en su cumpleaños: dos cañones de confeti
 * desde las esquinas inferiores apuntando al centro, una sola vez por sesión
 * (el sessionStorage evita repetirlo en cada navegación — la consulta en sí
 * no se cachea, porque su respuesta cambia a la medianoche).
 */
export default function BirthdayConfetti() {
  const { selectedCompany } = useCompanyStore();
  const { data } = useGetMyBirthdayToday(selectedCompany?.slug);
  const show = useSyncExternalStore(
    celebration.subscribe,
    celebration.isActive,
    () => false,
  );
  // Si la ventana cambia de tamaño los cañones se recalculan: no quedan pegados
  // a la medida del primer instante.
  const dimensions = useWindowSize();

  useEffect(() => {
    if (!data?.is_birthday) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    celebration.start();

    toast.success(
      `¡Feliz cumpleaños${data.first_name ? `, ${data.first_name}` : ""}! 🎉`,
      {
        description: "Que tengas un excelente día.",
        duration: DURATION_MS,
        position: "bottom-center",
      },
    );
  }, [data]);

  if (!show || typeof document === "undefined") return null;

  const { width, height } = dimensions;
  if (!width || !height) return null;

  const cannonWidth = Math.min(width / 2, 420);
  const sharedProps = {
    height,
    recycle: false,
    numberOfPieces: 140,
    gravity: 0.35,
    tweenDuration: 3000,
  };

  return createPortal(
    <>
      {/* react-confetti arma su <canvas> con left:0 Y right:0 puestos a la
          vez por defecto (ver su código fuente) — un elemento posicionado
          con ambos insets y sin width propio se ESTIRA para llenar el hueco
          entre los dos, aunque el canvas internamente dibuje en un área más
          angosta. Sin cancelar el lado opuesto (right/left: "auto") y fijar
          el width acá también, el canvas se estira a TODO el ancho de la
          ventana y el contenido queda deformado hacia el centro — eso era
          "el chorro centrado". */}
      <Confetti
        key="left"
        {...sharedProps}
        width={cannonWidth}
        confettiSource={{ x: 0, y: height - 10, w: 10, h: 10 }}
        initialVelocityX={{ min: 10, max: 26 }}
        initialVelocityY={{ min: -48, max: -28 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: "auto",
          width: cannonWidth,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      <Confetti
        key="right"
        {...sharedProps}
        width={cannonWidth}
        confettiSource={{ x: cannonWidth - 10, y: height - 10, w: 10, h: 10 }}
        initialVelocityX={{ min: -26, max: -10 }}
        initialVelocityY={{ min: -48, max: -28 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: "auto",
          width: cannonWidth,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </>,
    document.body,
  );
}
