"use client";

import { EditFuelVehicleForm } from "@/components/forms/mantenimiento/almacen/combustible/EditFuelVehicleForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FuelVehicle } from "@/types";
import { Pencil } from "lucide-react";
import { useState } from "react";

export function EditFuelVehicleDialog({
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar vehiculo</DialogTitle>
          <DialogDescription>
            Actualiza los datos del vehiculo. El saldo actual no se modifica
            aqui: se deriva de los movimientos.
          </DialogDescription>
        </DialogHeader>
        {/* key fuerza remount con valores frescos si cambia el vehiculo */}
        <EditFuelVehicleForm
          key={vehicle.id}
          company={company}
          vehicle={vehicle}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
