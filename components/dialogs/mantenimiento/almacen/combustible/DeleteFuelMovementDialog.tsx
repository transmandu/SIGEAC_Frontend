"use client";

import { useDeleteFuelMovement } from "@/actions/mantenimiento/almacen/combustible/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getFuelMovementLabel } from "@/lib/fuel";
import { FuelMovement } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteFuelMovementDialog({
  company,
  movement,
}: {
  company?: string;
  movement: FuelMovement;
}) {
  const [open, setOpen] = useState(false);
  const deleteMovement = useDeleteFuelMovement(company);

  // Solo tiene sentido sobre movimientos ya anulados (el backend lo exige).
  const isAnnulled = movement.status === "annulled";

  const handleDelete = async () => {
    await deleteMovement.mutateAsync(movement.id);
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!deleteMovement.isPending) setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-destructive hover:text-destructive"
          disabled={!isAnnulled}
          title={
            isAnnulled
              ? "Eliminar definitivamente"
              : "Solo se pueden eliminar movimientos anulados"
          }
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar movimiento anulado</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminara <strong>permanentemente</strong> el movimiento{" "}
            {getFuelMovementLabel(movement.type)} por {movement.liters} L junto
            con su registro de anulacion. Como ya fue anulado, los saldos no se
            ven afectados. Esta accion no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMovement.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMovement.isPending || !company || !isAnnulled}
          >
            {deleteMovement.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Eliminar definitivamente"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
