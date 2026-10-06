"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Fila de scroll horizontal con scroll nativo. El ScrollArea de Radix solo
 * responde a gestos horizontales (trackpad, shift+rueda): con un ratón común la
 * rueda no hacía nada y la fila se sentía pegada. Aquí la rueda vertical
 * desplaza la fila, salvo cuando ya está en el extremo, para no atrapar el
 * scroll de la página.
 */
export function HorizontalScroller({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Listener propio y no `onWheel`: React registra el de la rueda como pasivo
    // y desde ahí `preventDefault` no tiene efecto.
    const onWheel = (event: WheelEvent) => {
      const overflowing = el.scrollWidth > el.clientWidth;
      // Un gesto ya horizontal (trackpad) lo resuelve el navegador.
      if (!overflowing || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }

      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = el.scrollLeft >= max - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;

      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-x-auto overscroll-x-contain [scrollbar-width:thin]",
        className,
      )}
    >
      {children}
    </div>
  );
}
