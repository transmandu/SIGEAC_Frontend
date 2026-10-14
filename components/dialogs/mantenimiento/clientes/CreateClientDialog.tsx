"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateClientForm } from "@/components/forms/mantenimiento/clientes/CreateClientForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { clientesCrearAeronauticalSteps } from "@/components/tour/steps/ajustes/clientes/clientes-crear";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "clientes-crear",
        "Clientes - Crear",
        clientesCrearAeronauticalSteps,
      );
    }
    return () => unregisterTour("clientes-crear");
  }, [open, registerTour, unregisterTour]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear cliente
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle data-tour="clientes-crear-header">
            Crear Cliente
          </DialogTitle>
          <DialogDescription>Cree un nuevo cliente.</DialogDescription>
        </DialogHeader>
        <CreateClientForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
