import { Loader2 } from "lucide-react";
import React from "react";
export function LoadingDataTable() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px] border border-border bg-card/30 rounded-xl shadow-sm backdrop-blur-sm animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-12 animate-spin text-primary opacity-80" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Cargando registros...
        </p>
      </div>
    </div>
  );
}
