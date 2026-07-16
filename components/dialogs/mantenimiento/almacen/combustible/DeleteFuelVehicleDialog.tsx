"use client";

import { useDeleteFuelVehicle } from "@/actions/mantenimiento/almacen/combustible/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuelVehicle } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteFuelVehicleDialog({
  company,
  vehicle,
  open: openProp,
  onOpenChange,
}: {
  company?: string;
  vehicle: FuelVehicle;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  // When open/onOpenChange are supplied, the dialog is triggered from
  // outside (e.g. a dropdown menu item) instead of its own default button.
  const isControlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = isControlled ? openProp : openState;
  const setOpen = isControlled ? onOpenChange! : setOpenState;
  const [confirmPlate, setConfirmPlate] = useState("");
  const deleteVehicle = useDeleteFuelVehicle(company);

  // Si el vehiculo no tiene placa cargada, se confirma con un identificador
  // derivado del id para no bloquear el borrado.
  const confirmTarget = vehicle.plate?.trim() || `VEHICULO-${vehicle.id}`;

  const canConfirm =
    confirmPlate.trim().toUpperCase() === confirmTarget.toUpperCase();

  const handleDelete = async () => {
    if (!canConfirm) return;
    await deleteVehicle.mutateAsync(vehicle.id);
    setConfirmPlate("");
    setOpen(false);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!deleteVehicle.isPending) {
          setOpen(next);
          if (!next) setConfirmPlate("");
        }
      }}
    >
      {!isControlled && (
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar vehiculo {vehicle.plate || `#${vehicle.id}`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                Esta accion elimina <strong>permanentemente</strong> el vehiculo
                y <strong>todo su historial de movimientos</strong>. No se puede
                deshacer.
              </p>
              <p>
                Si el vehiculo hizo descargas al almacen, el saldo de almacen
                tambien se vera afectado. Si solo quieres dejar de usarlo,
                considera <strong>inactivarlo</strong> en su lugar.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor={`confirm-plate-${vehicle.id}`}>
            Escribe <strong>{confirmTarget}</strong> para confirmar
          </Label>
          <Input
            id={`confirm-plate-${vehicle.id}`}
            value={confirmPlate}
            onChange={(event) =>
              setConfirmPlate(event.target.value.toUpperCase())
            }
            placeholder={confirmTarget}
            className="uppercase"
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVehicle.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canConfirm || deleteVehicle.isPending || !company}
          >
            {deleteVehicle.isPending ? (
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
