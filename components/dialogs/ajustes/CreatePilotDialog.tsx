"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus, PlaneTakeoff } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreatePilotForm } from "@/components/forms/general/CreatePilotForm";

export default function CreatePilotDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Registrar piloto
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={PlaneTakeoff}
        title="Registro de Piloto"
        description="Seleccione el empleado e indique su número de licencia."
        className="sm:max-w-2xl"
      >
        <CreatePilotForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
