"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ej.: "Suspender convenio". */
  title: string;
  /** Registro afectado; se resalta en el texto. */
  entityName?: string;
  icon: LucideIcon;
  /** `amber` para lo que frena algo; `primary` para lo que lo restablece. */
  tone?: "amber" | "primary";
  /** Qué ocurre al confirmar. */
  children: React.ReactNode;
  confirmLabel: string;
  isPending?: boolean;
  /** Debe lanzar si falla: el diálogo solo se cierra si resuelve. */
  onConfirm: () => Promise<unknown> | void;
}

const TONES = {
  amber: {
    icon: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    note: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    button: "bg-amber-600/90 hover:bg-amber-600 text-white",
  },
  primary: {
    icon: "border-primary/20 bg-primary/10 text-primary",
    note: "border-primary/20 bg-primary/5 text-foreground/80",
    button: "",
  },
} as const;

/**
 * Confirmación de una acción reversible (suspender, reanudar). Mismo molde
 * que `ConfirmDeleteDialog`, sin el aviso de irreversible.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  entityName,
  icon: Icon,
  tone = "amber",
  children,
  confirmLabel,
  isPending = false,
  onConfirm,
}: ConfirmActionDialogProps) {
  const styles = TONES[tone];

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
          <div
            className={cn(
              "flex items-center justify-center size-12 rounded-2xl border",
              styles.icon,
            )}
          >
            <Icon className="size-5" />
          </div>

          <DialogTitle className="text-[16px] font-semibold tracking-tight">
            {title}
          </DialogTitle>

          {entityName && (
            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
              <span className="font-medium text-foreground">{entityName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div
          className={cn(
            "mx-6 mt-4 p-3 rounded-xl border text-sm leading-relaxed",
            styles.note,
          )}
        >
          {children}
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
            onClick={handleConfirm}
            disabled={isPending}
            className={cn("rounded-xl", styles.button)}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
