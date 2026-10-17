"use client";

import { useState, useEffect } from "react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { agenciasEnvioCrearSteps } from "@/components/tour/steps/ajustes/agencia-envios/agencias-envio-crear";

export function CreateShippingAgencyDialog() {
  const [open, setOpen] = useState(false);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "agencias-envio-crear",
        "Agencias - Crear",
        agenciasEnvioCrearSteps,
      );
    }

    return () => unregisterTour("agencias-envio-crear");
  }, [registerTour, unregisterTour, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear agencia
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader data-tour="agencias-envio-crear-header">
          <DialogTitle>Nueva agencia de envío</DialogTitle>
          <DialogDescription>
            Registre una agencia de envío para la gestión de distribución y
            logística.
          </DialogDescription>
        </DialogHeader>
        <CreateShippingAgencyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
