"use client";

import { useActionDialog } from "@/hooks/helpers/use-action-dialog";
import { MapPin, Plus } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import CreateLocationForm from "@/components/forms/ajustes/CreateLocationForm";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export default function CreateLocationDialog() {
  const [open, setOpen] = useActionDialog("crear-ubicacion");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="mr-2 h-4 w-4" />
          Crear sede
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={MapPin}
        title="Creación de Sede"
        description="Registre una sede de la empresa: ciudad, código IATA y tipo."
        className="sm:max-w-xl"
      >
        <CreateLocationForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
