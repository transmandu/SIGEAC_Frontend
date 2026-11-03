"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Plus, Ruler } from "lucide-react";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import CreateUnitForm from "@/components/forms/ajustes/CreateUnitForm";

export function CreateUnitDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear unidad
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={Ruler}
        title="Creación de Unidad"
        description="Registre una unidad de medida para los artículos del almacén."
        className="sm:max-w-lg"
      >
        <CreateUnitForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
