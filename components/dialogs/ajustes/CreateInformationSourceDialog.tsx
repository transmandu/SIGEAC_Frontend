"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus, Rss } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateInformationSourceForm } from "@/components/forms/aerolinea/sms/CreateInformationSourceForm";

export default function CreateInformationSourceDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear fuente
        </ActionTriggerButton>
      </DialogTrigger>
      <FormDialogContent
        icon={Rss}
        title="Creación de Fuente de Información"
        description="Registre una fuente de información indicando su nombre y tipo."
        className="sm:max-w-lg"
      >
        <CreateInformationSourceForm onClose={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
