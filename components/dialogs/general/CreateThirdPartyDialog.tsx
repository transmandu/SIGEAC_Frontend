"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserRoundCog } from "lucide-react";
import { useState } from "react";
import CreateThirdPartyForm from "@/components/forms/general/CreateThirdPartyForm";

export function CreateThirdPartyDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear tercero
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={UserRoundCog}
        title="Creación de Tercero"
        description="Cree un tercero rellenando la información necesaria."
        className="sm:max-w-lg"
      >
        <CreateThirdPartyForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
