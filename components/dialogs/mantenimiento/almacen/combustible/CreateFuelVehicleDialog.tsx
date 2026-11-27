"use client";

import { CreateFuelVehicleForm } from "@/components/forms/mantenimiento/almacen/combustible/CreateFuelVehicleForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useActionDialog } from "@/hooks/helpers/use-action-dialog";

export function CreateFuelVehicleDialog({ company }: { company?: string }) {
  const [open, setOpen] = useActionDialog("crear-vehiculo");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Vehiculo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Registrar vehiculo</DialogTitle>
          <DialogDescription>
            Crea un vehiculo terrestre y registra su saldo inicial si aplica.
          </DialogDescription>
        </DialogHeader>
        <CreateFuelVehicleForm
          company={company}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
