"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Pestañas del sistema: una barra que ocupa todo el ancho disponible, con las
 * pestañas centradas y, debajo de la activa, una píldora blanca con borde del
 * color primario que se desliza de una a otra.
 *
 * Sustituye a las pestañas sueltas de cada pantalla (ajustes, compras…) para
 * que todas lean igual. Se usa en lugar de `Tabs`/`TabsList`/`TabsTrigger`;
 * `SegmentedTabsContent` es el `TabsContent` de siempre.
 *
 * Dos niveles: `md` para las pestañas principales de una pantalla o diálogo y
 * `sm` para un segundo nivel (filtros de categoría, interruptores dentro de un
 * popover). Las pestañas conservan su tamaño: no se estiran para llenar la
 * barra.
 */

const SegmentedContext = createContext<string>("");

interface ListContextValue {
  size: "md" | "sm";
}

const ListContext = createContext<ListContextValue>({ size: "md" });

type TabsRootProps = ComponentPropsWithoutRef<typeof Tabs>;

export function SegmentedTabs({
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: TabsRootProps) {
  // La píldora necesita saber cuál es la pestaña activa, y Radix solo la
  // expone como atributo: se guarda también aquí, siga la pestaña controlada
  // desde fuera o no.
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = value ?? inner;

  return (
    <SegmentedContext.Provider value={current}>
      <Tabs
        value={current}
        onValueChange={(next) => {
          setInner(next);
          onValueChange?.(next);
        }}
        className={cn("w-full", className)}
        {...props}
      />
    </SegmentedContext.Provider>
  );
}

interface IndicatorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SegmentedTabsListProps extends ComponentPropsWithoutRef<
  typeof TabsList
> {
  size?: "md" | "sm";
}

export const SegmentedTabsList = forwardRef<
  ElementRef<typeof TabsList>,
  SegmentedTabsListProps
>(({ className, size = "md", children, ...props }, ref) => {
  const listRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => listRef.current as HTMLDivElement);

  const current = useContext(SegmentedContext);
  const reduceMotion = useReducedMotion();
  const [box, setBox] = useState<IndicatorBox | null>(null);
  // Si la medida viene de un cambio de tamaño de la barra (ventana, otra
  // línea) la píldora salta a su sitio; solo se desliza al cambiar de pestaña.
  const [snap, setSnap] = useState(true);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = (instant: boolean) => {
      const active = list.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"]',
      );
      setSnap(instant);
      setBox(
        active
          ? {
              x: active.offsetLeft,
              y: active.offsetTop,
              width: active.offsetWidth,
              height: active.offsetHeight,
            }
          : null,
      );
    };

    measure(false);
    const observer = new ResizeObserver(() => measure(true));
    observer.observe(list);
    return () => observer.disconnect();
  }, [current, children]);

  return (
    <ListContext.Provider value={{ size }}>
      <TabsList
        ref={listRef}
        className={cn(
          "relative flex h-auto flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100/60 text-muted-foreground dark:border-slate-700/60 dark:bg-slate-800/50",
          // Escalera hacia abajo: la barra principal es la más corta y cada nivel
          // siguiente es más ancho, sin tocar nunca los bordes del contenido. Todas
          // miden lo mismo de alto. En móvil ocupan todo el ancho.
          size === "md" ? "w-[85%] p-1" : "w-[91%] p-1",
          "mx-auto max-sm:w-full",
          className,
        )}
        {...props}
      >
        {box && (
          <motion.span
            aria-hidden
            // Al montar aparece con un fundido en su sitio; nunca "vuela" desde
            // la esquina.
            initial={{ ...box, opacity: 0 }}
            animate={{
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              opacity: 1,
            }}
            // Resorte sin rebote (amortiguamiento algo por encima del crítico):
            // arranca decidido y se asienta sin cola, a diferencia de una curva
            // de duración fija.
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    x: snap
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 46 },
                    y: snap
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 46 },
                    width: snap
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 46 },
                    height: { duration: 0 },
                    opacity: { duration: 0.25, ease: "easeOut" },
                  }
            }
            className="pointer-events-none absolute left-0 top-0 rounded-lg border border-primary/30 bg-background shadow-xs dark:bg-slate-900"
          />
        )}
        {children}
      </TabsList>
    </ListContext.Provider>
  );
});
SegmentedTabsList.displayName = "SegmentedTabsList";

export const SegmentedTabsTrigger = forwardRef<
  ElementRef<typeof TabsTrigger>,
  ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, children, ...props }, ref) => {
  const { size } = useContext(ListContext);

  return (
    <TabsTrigger
      ref={ref}
      className={cn(
        "relative gap-2 rounded-lg border border-slate-300/50 py-0 text-sm font-medium text-muted-foreground shadow-none transition-colors duration-300 ease-out hover:border-slate-300 hover:text-foreground dark:border-slate-600/40 dark:hover:border-slate-500/60 data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
        "h-7",
        size === "md" ? "px-4" : "px-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </TabsTrigger>
  );
});
SegmentedTabsTrigger.displayName = "SegmentedTabsTrigger";

export { TabsContent as SegmentedTabsContent };
