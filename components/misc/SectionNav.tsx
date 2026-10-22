"use client";

import { SECTION_JUMP_EVENT } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type SectionNavItem = { id: string; label: string; icon: LucideIcon };

/**
 * Tras un clic, margen para que arranque el scroll suave (se dispara con una
 * pequeña demora). Mientras el viaje siga emitiendo scroll, cada evento lo
 * prolonga JUMP_QUIET_MS: el viaje termina cuando deja de haber scroll, dure lo
 * que dure.
 */
const JUMP_START_MS = 500;

/** Bloquea el seguimiento del scroll hasta dentro de `ms`. */
const lockUntil = (ref: { current: number }, ms: number) => {
  ref.current = Date.now() + ms;
};
const JUMP_QUIET_MS = 150;

/** Primer ancestro que hace scroll (o el documento): donde mirar si se llegó al final. */
function scrollContainerOf(element: HTMLElement): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }
  return (document.scrollingElement ?? document.documentElement) as HTMLElement;
}

/**
 * Riel de secciones en el margen izquierdo del contenido: un icono por
 * sección (el mismo de su encabezado), siempre visible mientras se hace
 * scroll. El de la sección que se está leyendo se tiñe; el nombre sale solo
 * como tooltip al pasar el cursor. Al pulsar, despliega la sección si estaba
 * plegada y sube o baja hasta ella.
 *
 * Sección activa — se calcula en cada scroll con TODAS las secciones, no con
 * los cambios que reporta un observador (que dejaba la marca en una sección
 * distinta a la que se veía):
 *  - la que cruza una línea de lectura a ~35% de la altura de la pantalla; si
 *    la línea cae en un hueco entre secciones, la última que quedó por encima.
 *    Con secciones plegadas, que miden poco, es la que sigue de la línea.
 *  - si el scroll llegó al final de la página, la última (las de abajo no
 *    alcanzan nunca la línea de lectura).
 *  - tras un clic, la elegida se mantiene hasta que el usuario haga scroll por
 *    su cuenta: el viaje suave no la cambia por las secciones que cruza.
 *
 * Va en el margen que deja ContentLayout (su padding lateral): `absolute` a lo
 * alto de la página con el riel `sticky` dentro. Cada destino es una
 * FormSection con el `id` de su item. Se oculta en pantallas angostas.
 */
export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id);
  const ids = items.map((item) => item.id).join("|");
  const pinned = useRef<string | undefined>(undefined);
  const lockedUntil = useRef(0);

  const compute = useCallback(() => {
    if (pinned.current) {
      setActive(pinned.current);
      return;
    }

    const elements = ids
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const container = scrollContainerOf(elements[0]);
    const canScroll = container.scrollHeight > container.clientHeight + 4;
    const atEnd =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 4;

    if (canScroll && atEnd) {
      setActive(elements[elements.length - 1].id);
      return;
    }

    const line = Math.max(120, window.innerHeight * 0.35);
    let current = elements[0].id;
    for (const element of elements) {
      if (element.getBoundingClientRect().top <= line) current = element.id;
    }
    setActive(current);
  }, [ids]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };

    const onScroll = () => {
      // Durante el viaje de un clic no se recalcula; el primer scroll del
      // usuario después suelta la sección elegida.
      if (Date.now() < lockedUntil.current) {
        lockedUntil.current = Date.now() + JUMP_QUIET_MS;
        return;
      }
      pinned.current = undefined;
      schedule();
    };

    // En captura: el scroll no burbujea, y el que se desplaza puede ser un
    // contenedor del layout y no la ventana.
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", schedule);

    // Plegar o desplegar una sección cambia las alturas sin hacer scroll.
    const observer = new ResizeObserver(schedule);
    ids.split("|").forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [compute, ids]);

  const jumpTo = (id: string) => {
    window.dispatchEvent(new CustomEvent(SECTION_JUMP_EVENT, { detail: id }));
    pinned.current = id;
    lockUntil(lockedUntil, JUMP_START_MS);
    setActive(id);
    // Tras desplegar, para que el scroll cuente con la altura ya final.
    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="pointer-events-none absolute inset-y-0 left-2 z-20 hidden w-9 lg:block">
      {/* Franja pegada bajo el Navbar (h-14, sticky) y del alto del área visible
          restante (sin pasar del alto de la página, para no agregarle scroll): centrar
          el riel dentro de ella lo deja en el centro de lo que
          el usuario realmente ve, no de la pantalla entera. */}
      <div className="sticky top-14 flex h-full max-h-[calc(100dvh-3.5rem)] items-center">
        <TooltipProvider delayDuration={100} disableHoverableContent>
          <nav
            aria-label="Secciones de la página"
            className="pointer-events-auto flex w-full flex-col items-center gap-1 rounded-xl border border-slate-400/40 bg-background/80 p-1 shadow-xs backdrop-blur-md dark:border-slate-600/40"
          >
            {/* Rótulo corto: el riel mide lo que un icono, no cabe más texto. */}
            <span
              aria-hidden
              className="select-none px-1 pt-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70"
            >
              Nav
            </span>
            {items.map((item) => {
              const isActive = active === item.id;
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => jumpTo(item.id)}
                      aria-label={`Ir a ${item.label}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}
