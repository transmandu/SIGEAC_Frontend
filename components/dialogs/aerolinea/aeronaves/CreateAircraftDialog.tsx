"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AircraftForm } from "@/components/forms/aerolinea/aeronaves/AircraftForm";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crear aeronave</DialogTitle>
          <DialogDescription>
            Registre una aeronave de la flota o una externa para cargar su
            carga.
          </DialogDescription>
        </DialogHeader>
        <AircraftForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
