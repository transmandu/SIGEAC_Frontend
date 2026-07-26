"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Píxeles de scroll a partir de los cuales el cristal "toma cuerpo". */
  threshold?: number;
}

/**
 * Estado de scroll para el efecto liquid glass del Navbar.
 *
 * - `scrolled` alterna el estado visual (fondo, sombra, hairline).
 * - `sheen` es la posición del brillo especular, escrita como CSS var para
 *   que la anime el compositor y no provoque re-render en cada scroll.
 */
export const useScrollGlass = ({ threshold = 4 }: Options = {}) => {
  const [scrolled, setScrolled] = useState(false);

  const targetRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const scrolledRef = useRef(false);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;

      const y = window.scrollY;
      const isScrolled = y > threshold;

      if (isScrolled !== scrolledRef.current) {
        scrolledRef.current = isScrolled;
        setScrolled(isScrolled);
      }

      const node = targetRef.current;
      if (!node) return;

      // El brillo recorre el cristal según el avance del scroll. Se escribe
      // como custom property: no dispara render de React.
      const progress = Math.min(y / 600, 1);
      node.style.setProperty("--glass-sheen", `${120 - progress * 240}%`);
      node.style.setProperty(
        "--glass-sheen-opacity",
        isScrolled ? "1" : "0"
      );
      node.style.setProperty(
        "--glass-edge-opacity",
        isScrolled ? "1" : "0"
      );
    };

    const onScroll = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [threshold]);

  return { scrolled, targetRef };
};
