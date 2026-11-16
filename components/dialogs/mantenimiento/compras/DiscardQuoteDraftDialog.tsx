"use client";

import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";

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
  /** Debe lanzar si falla: el diálogo solo se cierra si resuelve. */
  onConfirm: () => Promise<unknown> | void;
  isPending?: boolean;
}) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Descartar borrador"
      entityName={
        orderNumber
          ? `el borrador de la solicitud ${orderNumber}`
          : "el borrador"
      }
      confirmLabel="Descartar"
      isPending={isPending}
      onConfirm={onConfirm}
      warning={
        <>
          La solicitud queda como estaba: un borrador nunca tomó número de
          cotización ni notificó a nadie.{" "}
          {pricedCount && pricedCount > 0
            ? `Se perderán los ${pricedCount} precio(s) ya capturados. No se puede recuperar.`
            : "No se puede recuperar."}
        </>
      }
    />
  );
}
