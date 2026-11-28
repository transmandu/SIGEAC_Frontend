"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { DialogButton, inferActionIcon } from "@/components/misc/DialogButton";
import { cn } from "@/lib/utils";

interface LibraryDialogActionsProps {
  onCancel: () => void;
  /** Texto del botón principal; mientras trabaja se muestra `busyLabel`. */
  submitLabel: string;
  busyLabel?: string;
  icon?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  /** Sin `onSubmit` el botón es de envío del formulario que lo contiene. */
  onSubmit?: () => void;
  cancelLabel?: string;
  cancelTourId?: string;
  submitTourId?: string;
}

/**
 * Pie de los diálogos de la biblioteca que no usan `ArticleFormShell` (porque
 * el botón principal es destructivo o no hay formulario): las mismas acciones
 * fijas abajo, con Cancelar en `outline` y el botón principal a `min-w-35`.
 */
export function LibraryDialogActions({
  onCancel,
  submitLabel,
  busyLabel,
  icon,
  busy = false,
  disabled = false,
  destructive = false,
  onSubmit,
  cancelLabel = "Cancelar",
  cancelTourId,
  submitTourId,
}: LibraryDialogActionsProps) {
  return (
    <div
      data-dialog-actions=""
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-1 flex justify-end gap-3 border-t bg-linear-to-t from-slate-50 to-background px-4 py-3 sm:-mx-6 sm:px-6 sm:py-4 dark:from-slate-900/40",
        "max-sm:flex-col-reverse max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:[&>button]:w-full",
      )}
    >
      <DialogButton
        tone="cancel"
        onClick={onCancel}
        disabled={busy}
        data-tour={cancelTourId}
      >
        {cancelLabel}
      </DialogButton>
      <DialogButton
        type={onSubmit ? "button" : "submit"}
        tone={destructive ? "danger" : "primary"}
        onClick={onSubmit}
        busy={busy}
        disabled={disabled}
        icon={icon ?? (destructive ? <Trash2 /> : inferActionIcon(submitLabel))}
        data-tour={submitTourId}
        className="min-w-35"
      >
        {busy && busyLabel ? busyLabel : submitLabel}
      </DialogButton>
    </div>
  );
}
