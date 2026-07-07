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
        if (prev.some((t) => t.key === key)) return prev;
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

  if (availableTours.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12"
          size="icon"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-64 p-2">
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
      </PopoverContent>
    </Popover>
  );
}

interface CustomTourProviderProps {
  children: ReactNode;
}

const tourStyles = {
  popover: (base: Record<string, unknown>) => ({
    ...base,
    background: "#1e293b",
    color: "#f8fafc",
    borderRadius: 12,
    padding: 20,
  }),
  badge: (base: Record<string, unknown>) => ({
    ...base,
    background: "#334155",
    color: "#94a3b8",
  }),
  navigation: (base: Record<string, unknown>) => ({
    ...base,
    color: "#f8fafc",
  }),
  arrow: (_base: Record<string, unknown>, state?: Record<string, unknown>) => ({
    color: state?.disabled ? "#475569" : "#f8fafc",
    width: 16,
    height: 12,
    flex: "0 0 16px",
  }),
  close: (base: Record<string, unknown>) => ({
    ...base,
    color: "#94a3b8",
    top: 8,
    right: 8,
    _hover: { color: "#f8fafc" },
  }),
};

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
    >
      <TourInner tourKeyRef={tourKeyRef}>{children}</TourInner>
    </TourProvider>
  );
}
