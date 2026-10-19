"use client";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Creación de Fuente de Información</DialogTitle>
          <DialogDescription>
            Registre una fuente de información indicando su nombre y tipo.
          </DialogDescription>
        </DialogHeader>
        <CreateInformationSourceForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
