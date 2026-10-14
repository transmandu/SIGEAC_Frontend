"use client";

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
import { useState, useEffect } from "react";
import { CreateClientForm } from "@/components/forms/general/CreateClientForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { clientesCrearSteps } from "@/components/tour/steps/ajustes/clientes/clientes-crear";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour("clientes-crear", "Clientes - Crear", clientesCrearSteps);
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
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault(); // Evita que el diálogo se cierre al hacer clic fuera
        }}
      >
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
