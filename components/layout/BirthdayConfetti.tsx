"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Confetti from "react-confetti";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMyBirthdayToday } from "@/hooks/sistema/usuario/useGetMyBirthdayToday";
import { useWindowSize } from "@/hooks/useWindowSize";

// Una marca por usuario y día, en localStorage: se comparte entre todas las
// ventanas y pestañas de un mismo navegador (no se repite aunque cierres sesión
// y vuelvas a entrar), pero otro navegador u otro dispositivo es otro
// almacenamiento, así que ahí el saludo sale una vez más. El día viene del
// servidor (zona de la empresa) para que coincida con el que decidió el saludo.
const KEY_PREFIX = "sigeac_birthday_greeted_";
const greetedInMemory = new Set<string>();

const wasGreeted = (key: string) => {
  if (greetedInMemory.has(key)) return true;
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

const markGreeted = (key: string) => {
  // Sin localStorage (modo privado, bloqueado) la marca en memoria evita al
  // menos repetirlo mientras no se recargue la página.
  greetedInMemory.add(key);
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const stored = localStorage.key(i);
      if (stored?.startsWith(KEY_PREFIX) && stored !== key) {
        localStorage.removeItem(stored);
      }
    }
    localStorage.setItem(key, "1");
  } catch {}
};
const TOAST_MS = 6000;
// Tope de seguridad: el confeti termina solo cuando cae la última pieza
// (onConfettiComplete); esto solo evita que un canvas se quede vivo si el
// navegador pausó la animación (pestaña en segundo plano).
const MAX_MS = 15000;

// La celebración vive fuera de React para que sobreviva a los remontajes del
// layout; React solo la lee.
const celebration = (() => {
  let active = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
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
      clearTimeout(timer);
      set(true);
      timer = setTimeout(() => set(false), MAX_MS);
    },
    stop: () => {
      clearTimeout(timer);
      set(false);
    },
  };
})();

const COLORS = [
  "#204870",
  "#184890",
  "#4878c8",
  "#60a8c8",
  "#8cc6e0",
  "#f5c542",
  "#ffffff",
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Saludo al usuario cuando entra en su cumpleaños: dos cañones de confeti
 * desde las esquinas inferiores apuntando al centro, una sola vez por día y
 * navegador (la consulta en sí no se cachea, porque su respuesta cambia a la
 * medianoche).
 */
export default function BirthdayConfetti() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const { data } = useGetMyBirthdayToday(selectedCompany?.slug);
  const show = useSyncExternalStore(
    celebration.subscribe,
    celebration.isActive,
    () => false,
  );
  // Si la ventana cambia de tamaño los cañones se recalculan: no quedan pegados
  // a la medida del primer instante.
  const dimensions = useWindowSize();
  const done = useRef({ left: false, right: false });

  useEffect(() => {
    if (!data?.is_birthday) return;
    if (typeof window === "undefined") return;
    if (!user?.id || !data.date) return;

    const key = `${KEY_PREFIX}${user.id}_${data.date}`;
    if (wasGreeted(key)) return;

    markGreeted(key);
    // Con "reducir movimiento" solo se muestra el saludo, sin confeti.
    if (!prefersReducedMotion()) {
      done.current = { left: false, right: false };
      celebration.start();
    }

    toast.success(
      `¡Feliz cumpleaños${data.first_name ? `, ${data.first_name}` : ""}! 🎉`,
      {
        description: "Que tengas un excelente día.",
        duration: TOAST_MS,
        position: "bottom-center",
      },
    );
  }, [data, user?.id]);

  const handleComplete = (side: "left" | "right") => {
    done.current[side] = true;
    if (done.current.left && done.current.right) celebration.stop();
  };

  if (!show || typeof document === "undefined") return null;

  const { width, height } = dimensions;
  if (!width || !height) return null;

  // Cada cañón usa un canvas del tamaño de la ventana: con uno más angosto las
  // piezas se cortaban en seco al cruzar su borde interior. Las dos capas se
  // acaban de forma independiente y el confeti se retira cuando ambas
  // terminaron, no a un tiempo fijo que cortaba piezas en el aire.
  const sharedProps = {
    width,
    height,
    colors: COLORS,
    recycle: false,
    numberOfPieces: 140,
    gravity: 0.35,
    tweenDuration: 3000,
    style: {
      position: "fixed" as const,
      inset: 0,
      zIndex: 9999,
      pointerEvents: "none" as const,
    },
  };

  return createPortal(
    <>
      <Confetti
        key="left"
        {...sharedProps}
        onConfettiComplete={() => handleComplete("left")}
        confettiSource={{ x: 0, y: height - 10, w: 10, h: 10 }}
        initialVelocityX={{ min: 10, max: 26 }}
        initialVelocityY={{ min: -48, max: -28 }}
      />
      <Confetti
        key="right"
        {...sharedProps}
        onConfettiComplete={() => handleComplete("right")}
        confettiSource={{ x: width - 10, y: height - 10, w: 10, h: 10 }}
        initialVelocityX={{ min: -26, max: -10 }}
        initialVelocityY={{ min: -48, max: -28 }}
      />
    </>,
    document.body,
  );
}
