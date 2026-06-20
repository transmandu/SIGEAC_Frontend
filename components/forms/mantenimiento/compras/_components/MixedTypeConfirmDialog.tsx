"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, SplitSquareHorizontal } from "lucide-react"

interface MixedTypeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function MixedTypeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: MixedTypeConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-[440px]
          rounded-3xl
          border border-border/50
          bg-background/95
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
          p-0
        "
      >
        <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
          <div
            className="
              flex items-center justify-center
              size-12 rounded-2xl
              border border-amber-500/15
              bg-amber-500/[0.08]
            "
          >
            <SplitSquareHorizontal className="size-5 text-amber-600" />
          </div>

          <DialogTitle className="text-[16px] font-semibold tracking-tight">
            Se dividirá tu solicitud
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
            Tu solicitud contiene tanto artículos por lote como artículos generales.
          </DialogDescription>
        </DialogHeader>

        {/* WARNING BOX */}
        <div className="mx-6 mt-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] text-sm text-amber-700 dark:text-amber-400 flex gap-2 leading-relaxed">
          <SplitSquareHorizontal className="size-4 mt-[2px] shrink-0" />
          <div>
            Al continuar, el sistema dividirá automáticamente esta orden en{" "}
            <b>dos solicitudes separadas</b> con la misma información, para
            procesarlas correctamente: una con los artículos por lote y otra
            con los artículos generales.
          </div>
        </div>

        {/* ACTIONS */}
        <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="
              rounded-xl
              border border-border/60
              bg-background
              hover:bg-muted
              text-muted-foreground
              hover:text-foreground
            "
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="
              rounded-xl
              bg-amber-600/90
              hover:bg-amber-600
              text-white
            "
          >
            {isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sí, continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
