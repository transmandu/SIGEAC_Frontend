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
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Registro de Piloto</DialogTitle>
          <DialogDescription>
            Seleccione el empleado e indique su número de licencia.
          </DialogDescription>
        </DialogHeader>
        <CreatePilotForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
