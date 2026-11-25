"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  hasErrors: boolean;
  hasChanges: boolean;
  isPending: boolean;
  isOverweight: boolean;
  onSubmit: () => void;
}

export function ManifestFormFooter({
  hasErrors,
  hasChanges,
  isPending,
  isOverweight,
  onSubmit,
}: Props) {
  return (
    <div className="flex items-center justify-end border-t pt-3">
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
          disabled={!hasChanges || hasErrors || isPending || isOverweight}
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
