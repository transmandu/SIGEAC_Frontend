"use client";

import {
  EditReasonFields,
  EditReasonValue,
  backendMessageFrom,
  editReasonErrorFrom,
} from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EditReason } from "@/lib/planificacion/editReasons";
import { AlertTriangle, Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";

export interface ConfirmedReason {
  edit_reason: EditReason;
  edit_note?: string;
}

interface ReasonConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Si lanza, el diálogo queda abierto mostrando el mensaje del backend. */
  onConfirm: (reason: ConfirmedReason) => Promise<unknown>;
}

/**
 * Eliminar, dar de baja o reactivar algo de Planificación: siempre con motivo,
 * que queda en la auditoría.
 */
export function ReasonConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
}: ReasonConfirmDialogProps) {
  const [reason, setReason] = useState<EditReasonValue>({});
  const [reasonError, setReasonError] = useState<string>();
  const [backendError, setBackendError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason({});
      setReasonError(undefined);
      setBackendError(undefined);
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (isPending) return;

    if (!reason.edit_reason) {
      setReasonError("Indique el motivo.");
      return;
    }

    setIsPending(true);
    setBackendError(undefined);
    try {
      await onConfirm({
        edit_reason: reason.edit_reason,
        edit_note: reason.edit_note || undefined,
      });
      handleOpenChange(false);
    } catch (error) {
      const fieldError = editReasonErrorFrom(error);
      if (fieldError) {
        setReasonError(fieldError);
      } else {
        setBackendError(
          backendMessageFrom(error) ?? "No se pudo completar la acción.",
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground">{description}</div>
          </DialogDescription>
        </DialogHeader>

        <EditReasonFields
          value={reason}
          onChange={(value) => {
            setReason(value);
            setReasonError(undefined);
          }}
          error={reasonError}
          label="Motivo"
        />

        {backendError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{backendError}</span>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            className="min-w-28"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
