"use client";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creación de Tercero</DialogTitle>
          <DialogDescription>
            Cree un tercero rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateThirdPartyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
