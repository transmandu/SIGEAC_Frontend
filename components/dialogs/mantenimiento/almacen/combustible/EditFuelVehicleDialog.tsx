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
}: {
  company?: string;
  vehicle: FuelVehicle;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
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
