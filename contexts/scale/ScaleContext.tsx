"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { useSerialScale } from "@/hooks/operaciones/scale/useSerialScale";
import { ScaleState, ScaleCaptureResult } from "@/lib/scale/scale.types";

interface ScaleContextType {
  state: ScaleState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  captureStableWeight: () => ScaleCaptureResult | null;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

export const ScaleProvider = ({ children }: { children: ReactNode }) => {
  const { state, connect, disconnect, captureStableWeight } = useSerialScale();

  const value = useMemo(
    () => ({
      state,
      connect,
      disconnect,
      captureStableWeight,
    }),
    [state, connect, disconnect, captureStableWeight],
  );

  return (
    <ScaleContext.Provider value={value}>{children}</ScaleContext.Provider>
  );
};

export const useScale = (): ScaleContextType => {
  const ctx = useContext(ScaleContext);
  if (!ctx) {
    throw new Error("useScale debe usarse dentro de <ScaleProvider>");
  }
  return ctx;
};
