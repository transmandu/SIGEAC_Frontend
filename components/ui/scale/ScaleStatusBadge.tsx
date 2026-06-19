"use client";

import { useScale } from "@/contexts/scale/ScaleContext";
import { cn } from "@/lib/utils";

export function ScaleStatusBadge() {
  const { state } = useScale();

  const config = {
    idle: { label: "Desconectado", className: "bg-muted text-muted-foreground" },
    connecting: { label: "Conectando...", className: "bg-yellow-500/20 text-yellow-700 animate-pulse" },
    connected: {
      label: state.isStable ? "Peso Estable" : "Peso Inestable",
      className: state.isStable
        ? "bg-green-500/20 text-green-700 border-green-500/50"
        : "bg-orange-500/20 text-orange-700 border-orange-500/50",
    },
    disconnected: { label: "Desconectado", className: "bg-muted text-muted-foreground" },
    error: { label: "Error", className: "bg-red-500/20 text-red-700 border-red-500/50" },
    unsupported: { label: "No Soportado", className: "bg-gray-500/20 text-gray-700" },
  };

  const current = config[state.status] || config.idle;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        current.className
      )}
    >
      {current.label}
      {state.status === "connected" && state.reading && (
        <span className="ml-1.5 tabular-nums">
          {state.reading.weight.toFixed(2)} kg
        </span>
      )}
    </span>
  );
}