"use client";

import { Trash2 } from "lucide-react";

import { DialogButton } from "@/components/misc/DialogButton";

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
    <DialogButton
      tone="cancel"
      disabled={disabled}
      onClick={onClick}
      icon={<Trash2 />}
    >
      Descartar borrador
    </DialogButton>
  );
}
