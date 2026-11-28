"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import { TourProvider, useTour, StepType } from "@reactour/tour";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TourInfo {
  key: string;
  label: string;
  start: () => void;
}

interface RegisterTourOptions {
  /**
   * Al iniciar el tour, descarta los pasos cuyo elemento no se ve en ese
   * momento (no existe, está oculto o mide cero): botones que dependen del rol,
   * paneles ocultos en móvil, pestañas que solo salen en ciertos casos. No usar
   * en un tour cuyos pasos señalan algo que aparece durante el recorrido.
   */
  onlyVisible?: boolean;
}

interface TourContextType {
  startTour: (steps: StepType[], tourKey: string) => void;
  availableTours: TourInfo[];
  registerTour: (
    key: string,
    label: string,
    steps: StepType[],
    options?: RegisterTourOptions,
  ) => void;
  unregisterTour: (key: string) => void;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  availableTours: [],
  registerTour: () => {},
  unregisterTour: () => {},
});

export const useTourContext = () => useContext(TourContext);

/** El elemento existe y ocupa espacio: es algo que el usuario puede ver ahora. */
function isShown(selector: string): boolean {
  try {
    const element = document.querySelector(selector);
    if (!element) return false;

    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  } catch {
    // Un selector que el navegador no entiende no se descarta: mejor un paso de más.
    return true;
  }
}

/** Los pasos de un tour que tienen su elemento a la vista (los que no señalan nada se conservan). */
export function visibleSteps(steps: StepType[]): StepType[] {
  return steps.filter(
    (step) => typeof step.selector !== "string" || isShown(step.selector),
  );
}

/**
 * Cada paso trae a la vista su elemento antes de resaltarlo. reactour solo
 * desplaza la ventana: un elemento dentro de un panel con scroll propio (el
 * árbol de carpetas, una lista) que estaba fuera de la vista quedaba
 * señalado en otro lugar. Tras desplazar se fuerza un `resize` para que
 * recalcule la posición.
 */
function withScrollIntoView(step: StepType): StepType {
  if (typeof step.selector !== "string") return step;
  const selector = step.selector;
  const original = step.action;

  return {
    ...step,
    action: (element) => {
      original?.(element);
      const target = element ?? document.querySelector(selector);
      if (!target) return;

      target.scrollIntoView({ block: "nearest", inline: "nearest" });
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    },
  };
}

interface TourInnerProps {
  children: ReactNode;
  tourKeyRef: React.MutableRefObject<string | null>;
}

function TourInner({ children, tourKeyRef }: TourInnerProps) {
  const { setIsOpen, setSteps, setCurrentStep, isOpen } = useTour();
  const [availableTours, setAvailableTours] = useState<TourInfo[]>([]);

  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !isOpen && tourKeyRef.current) {
      localStorage.setItem(`tour-${tourKeyRef.current}-completed`, "true");
      tourKeyRef.current = null;
    }
    wasOpen.current = isOpen;
  }, [isOpen, tourKeyRef]);

  const startTour = useCallback(
    (steps: StepType[], tourKey: string) => {
      if (setSteps && setCurrentStep && setIsOpen) {
        tourKeyRef.current = tourKey;
        setSteps(steps.map(withScrollIntoView));
        setCurrentStep(0);
        setIsOpen(true);
      }
    },
    [setSteps, setCurrentStep, setIsOpen, tourKeyRef],
  );

  const registerTour = useCallback(
    (
      key: string,
      label: string,
      steps: StepType[],
      options?: RegisterTourOptions,
    ) => {
      // Los pasos visibles se calculan al pulsar el tour, no al registrarlo:
      // en ese momento es cuando el usuario ve (o no) cada elemento.
      const start = () => {
        const toShow = options?.onlyVisible ? visibleSteps(steps) : steps;

        if (toShow.length === 0) {
          toast.info(
            "Este recorrido no tiene nada que mostrar en su pantalla.",
          );
          return;
        }

        startTour(toShow, key);
      };

      setAvailableTours((prev) => {
        if (prev.some((t) => t.key === key)) {
          return prev.map((t) => (t.key === key ? { ...t, start } : t));
        }
        return [...prev, { key, label, start }];
      });
    },
    [startTour],
  );

  const unregisterTour = useCallback((key: string) => {
    setAvailableTours((prev) =>
      prev.some((t) => t.key === key)
        ? prev.filter((t) => t.key !== key)
        : prev,
    );
  }, []);

  const value = useMemo(
    () => ({ startTour, availableTours, registerTour, unregisterTour }),
    [startTour, availableTours, registerTour, unregisterTour],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <FloatingTourMenu />
    </TourContext.Provider>
  );
}

function FloatingTourMenu() {
  const { availableTours } = useTourContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (availableTours.length === 0) return null;

  return (
    <div
      ref={ref}
      data-tour-menu="true"
      // Por encima de los diálogos a propósito: hay tours que se inician desde
      // dentro de uno. Con alertas a la vista sube sobre su botón (z-40, por
      // debajo de diálogos y menús) para que nunca se solapen, y se retira
      // mientras el panel de alertas está abierto (ver globals.css).
      className="fixed bottom-(--fab-alert-offset,1rem) right-7 z-100 flex flex-col items-end gap-2 pointer-events-auto transition-[bottom,opacity] duration-300"
    >
      {open && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-64 p-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            Tours disponibles
          </p>
          <div className="flex flex-col gap-1">
            {availableTours.map((tour) => (
              <Button
                key={tour.key}
                variant="ghost"
                className="justify-start h-8 text-sm"
                onClick={() => {
                  tour.start();
                  setOpen(false);
                }}
              >
                {tour.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      <Button
        size="icon"
        className="rounded-full h-12 w-12 shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}

interface CustomTourProviderProps {
  children: ReactNode;
}

const tourStyles = {
  popover: (base: Record<string, unknown>) => ({
    ...base,
    background: "var(--tour-bg)",
    color: "var(--tour-color)",
    borderRadius: 12,
    padding: 20,
  }),
  badge: (base: Record<string, unknown>) => ({
    ...base,
    background: "var(--tour-badge-bg)",
    color: "var(--tour-badge-color)",
  }),
  navigation: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--tour-color)",
  }),
  arrow: (_base: Record<string, unknown>, state?: Record<string, unknown>) => ({
    color: state?.disabled
      ? "var(--tour-arrow-disabled)"
      : "var(--tour-arrow-enabled)",
    width: 16,
    height: 12,
    flex: "0 0 16px",
  }),
  close: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--tour-close-color)",
    top: 8,
    right: 8,
    _hover: { color: "var(--tour-close-hover)" },
  }),
};

function TourUiWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div data-tour-popover="true" style={{ pointerEvents: "auto" }}>
      {children}
    </div>
  );
}

export function CustomTourProvider({ children }: CustomTourProviderProps) {
  const tourKeyRef = useRef<string | null>(null);

  return (
    <TourProvider
      steps={[]}
      showDots={false}
      showNavigation
      showBadge
      disableInteraction={false}
      styles={tourStyles}
      Wrapper={TourUiWrapper}
    >
      <TourInner tourKeyRef={tourKeyRef}>{children}</TourInner>
    </TourProvider>
  );
}
