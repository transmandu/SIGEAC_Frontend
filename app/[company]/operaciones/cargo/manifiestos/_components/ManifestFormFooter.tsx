"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  totalWeight: number;
  totalUnits: number;
  activeCount: number;
  hasErrors: boolean;
  hasChanges: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export function ManifestFormFooter({
  totalWeight,
  totalUnits,
  activeCount,
  hasErrors,
  hasChanges,
  isPending,
  onSubmit,
}: Props) {
  return (
    <div className="flex items-center justify-between border-t pt-3">
      {/* Totales */}
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{activeCount}</span>{" "}
        ítem(s) —{" "}
        <span className="font-semibold text-primary">
          {totalWeight.toFixed(2)} kg
        </span>{" "}
        — <span className="font-semibold text-primary">{totalUnits} und</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        {hasErrors && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Corrige los errores antes de guardar.
          </p>
        )}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!hasChanges || hasErrors || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" /> Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </div>
  );
}
