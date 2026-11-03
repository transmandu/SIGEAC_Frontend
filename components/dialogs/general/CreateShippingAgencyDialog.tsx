"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState, useEffect } from "react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Truck } from "lucide-react";
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

      <FormDialogContent
        icon={Truck}
        title="Nueva agencia de envío"
        description="Registre una agencia de envío para la gestión de distribución y logística."
        tourId="agencias-envio-crear-header"
        className="sm:max-w-2xl"
      >
        <CreateShippingAgencyForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
