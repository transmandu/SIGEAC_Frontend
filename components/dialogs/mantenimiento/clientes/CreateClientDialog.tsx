"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useEffect, useState } from "react";
import { Plus, UserRound } from "lucide-react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
      <FormDialogContent
        icon={UserRound}
        title="Crear Cliente"
        description="Cree un nuevo cliente."
        tourId="clientes-crear-header"
        className="sm:max-w-3xl"
      >
        <CreateClientForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
