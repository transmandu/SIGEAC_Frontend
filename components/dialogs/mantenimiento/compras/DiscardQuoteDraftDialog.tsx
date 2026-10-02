"use client";

import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Confirmación de descarte de un borrador.
 *
 * Descartarlo no deshace nada emitido —un borrador nunca tomó correlativo ni
 * movió su solicitud— pero sí pierde los precios capturados, que es lo que hay
 * que advertir.
 */
export function DiscardQuoteDraftDialog({
  orderNumber,
  pricedCount,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  orderNumber?: string | null;
  pricedCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent className="max-w-md gap-3 p-5">
        <AlertDialogHeader className="space-y-1.5">
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <Trash2 className="size-5 text-destructive" />
            ¿Descartar el borrador?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs">
            {orderNumber ? (
              <>
                Solicitud{" "}
                <span className="font-mono font-medium text-foreground">
                  {orderNumber}
                </span>
                .{" "}
              </>
            ) : null}
            La solicitud queda como estaba: un borrador nunca tomó número de
            cotización ni notificó a nadie.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="rounded-lg border border-amber-300/50 bg-amber-50/50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
          {pricedCount && pricedCount > 0
            ? `Se perderán los ${pricedCount} precio(s) ya capturados. No se puede recuperar.`
            : "No se puede recuperar."}
        </p>

        <AlertDialogFooter className="gap-2 border-t pt-4 sm:gap-0">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 h-9 border-border/70 bg-background/70 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Conservar
          </AlertDialogCancel>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs transition-all hover:shadow-md"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Descartar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
