"use client";

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
import { CreateWorkshopForm } from "@/components/forms/general/CreateWorkshopForm";
import { Plus } from "lucide-react";
import type { Workshop } from "@/types";

interface CreateWorkshopDialogProps {
  onSuccess?: (workshop: Workshop) => void;
  triggerButton?: React.ReactNode;
}

export function CreateWorkshopDialog({
  onSuccess,
  triggerButton,
}: CreateWorkshopDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            onClick={() => setOpen(true)}
            variant={"outline"}
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Creación de Taller</DialogTitle>
          <DialogDescription>
            Registre un taller externo rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateWorkshopForm
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
