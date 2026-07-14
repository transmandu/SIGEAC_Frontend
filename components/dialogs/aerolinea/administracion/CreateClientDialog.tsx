"use client";

import { Button } from "@/components/ui/button";
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
import { clientesCrearSteps } from "@/components/tour/steps/ajustes/globales/clientes/clientes-crear";

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
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Registrar Cliente
        </Button>
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
