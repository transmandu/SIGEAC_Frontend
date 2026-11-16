"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState } from "react";
import { Plus, Plane } from "lucide-react";
import { CreateAircraftForm } from "@/components/forms/aerolinea/aeronaves/CreateAircraftForm";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export function CreateAircraftDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="mr-2 h-4 w-4" />
          Crear aeronave
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={Plane}
        title="Crear aeronave"
        description="Registre una aeronave de la flota o una externa para cargar su carga."
        className="sm:max-w-4xl"
      >
        <CreateAircraftForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
