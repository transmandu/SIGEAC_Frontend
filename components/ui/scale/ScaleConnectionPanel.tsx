"use client";

import { useScale } from "@/contexts/scale/ScaleContext";
import { Button } from "@/components/ui/button";
import { ScaleStatusBadge } from "./ScaleStatusBadge";
import { Activity, Unplug, Plug } from "lucide-react";

export function ScaleConnectionPanel() {
  const { state, connect, disconnect } = useScale();

  const isConnected = state.status === "connected";
  const isConnecting = state.status === "connecting";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <ScaleStatusBadge />

      {state.isSimulated && (
        <span className="text-[10px] uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
          Simulación
        </span>
      )}
  
      {isConnected && state.reading !== null && (
        <span
          className={`text-sm font-mono font-semibold px-2 py-0.5 rounded ${
            state.isStable
              ? "text-green-700 bg-green-100"
              : "text-yellow-700 bg-yellow-100"
          }`}
        >
          {state.reading.weight.toFixed(2)} kg
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {state.error && (
          <span
            className="text-xs text-destructive max-w-[200px] truncate"
            title={state.error}
          >
            {state.error}
          </span>
        )}

        {!isConnected ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Activity className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plug className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isConnecting ? "Conectando..." : "Conectar"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => {
              disconnect();
            }}
          >
            <Unplug className="mr-1.5 h-3.5 w-3.5" />
            Desconectar
          </Button>
        )}
      </div>
    </div>
  );
}
