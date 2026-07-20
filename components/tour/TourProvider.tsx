"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import { TourProvider, useTour, StepType } from "@reactour/tour";
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

interface TourContextType {
  startTour: (steps: StepType[], tourKey: string) => void;
  availableTours: TourInfo[];
  registerTour: (key: string, label: string, steps: StepType[]) => void;
  unregisterTour: (key: string) => void;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  availableTours: [],
  registerTour: () => {},
  unregisterTour: () => {},
});

export const useTourContext = () => useContext(TourContext);

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
        setSteps(steps);
        setCurrentStep(0);
        setIsOpen(true);
      }
    },
    [setSteps, setCurrentStep, setIsOpen, tourKeyRef],
  );

  const registerTour = useCallback(
    (key: string, label: string, steps: StepType[]) => {
      setAvailableTours((prev) => {
        if (prev.some((t) => t.key === key)) {
          return prev.map((t) =>
            t.key === key ? { ...t, start: () => startTour(steps, key) } : t,
          );
        }
        return [...prev, { key, label, start: () => startTour(steps, key) }];
      });
    },
    [startTour],
  );

  const unregisterTour = useCallback((key: string) => {
    setAvailableTours((prev) => prev.filter((t) => t.key !== key));
  }, []);

  return (
    <TourContext.Provider
      value={{ startTour, availableTours, registerTour, unregisterTour }}
    >
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
      className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2 pointer-events-auto"
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
