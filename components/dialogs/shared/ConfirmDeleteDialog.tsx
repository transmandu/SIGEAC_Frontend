"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ej.: "Eliminar fabricante". */
  title: string;
  /** Nombre del registro; se resalta en el texto. */
  entityName?: string;
  /** Detalle propio de la entidad (qué pasa con lo relacionado). */
  warning?: React.ReactNode;
  isPending?: boolean;
  /** Debe lanzar si falla: el diálogo solo se cierra si resuelve. */
  onConfirm: () => Promise<unknown> | void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  entityName,
  warning,
  isPending = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // El aviso lo muestra la mutación; el diálogo queda abierto.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center size-12 rounded-2xl border border-red-500/15 bg-red-500/8">
            <AlertTriangle className="size-5 text-red-600" />
          </div>

          <DialogTitle className="text-[16px] font-semibold tracking-tight">
            {title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
            {entityName ? (
              <>
                Vas a eliminar{" "}
                <span className="font-medium text-foreground">{entityName}</span>
              </>
            ) : (
              "Vas a eliminar este registro"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-600 flex gap-2 leading-relaxed">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div>
            {warning ?? (
              <>
                Esta acción es <b>irreversible</b> y eliminará permanentemente
                el registro del sistema.
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-xl bg-red-600/90 hover:bg-red-600"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
