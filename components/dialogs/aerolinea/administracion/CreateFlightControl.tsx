"use client";

import CreateFlightControlForm from "@/components/forms/mantenimiento/ordenes_trabajo/CreateFlightControlForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface CreateFlightControlDialogProps {
  defaultAircraftId?: string; // El signo '?' la hace opcional
}

export function CreateFlightControlDialog({
  defaultAircraftId,
}: CreateFlightControlDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Nuevo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[900px] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Creación de Vuelo</DialogTitle>
          <DialogDescription>
            Cree un vuelo rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto -mx-6 px-6">
          <CreateFlightControlForm
            onClose={() => setOpen(false)}
            deafultAircraftId={defaultAircraftId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
