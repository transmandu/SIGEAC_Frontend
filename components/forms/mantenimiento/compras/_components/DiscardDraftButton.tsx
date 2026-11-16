"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Salida del borrador de cotización. Va a la izquierda del pie, separada de
 * guardar y emitir: es abandonar el borrador, no un paso de la captura.
 */
export default function DiscardDraftButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="gap-2 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
    >
      <Trash2 className="size-4" />
      Descartar borrador
    </Button>
  );
}
