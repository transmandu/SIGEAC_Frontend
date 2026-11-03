"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Plus, Store } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CreateRetailerForm from "@/components/forms/general/CreateRetailerForm";

export function CreateRetailerDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear comercio
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={Store}
        title="Creación de Comercio"
        description="Registre un comercio o lugar de compra (tienda física o en línea) rellenando la información necesaria."
        className="sm:max-w-lg"
      >
        <CreateRetailerForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
