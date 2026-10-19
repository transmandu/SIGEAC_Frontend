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
import { useState } from "react";
import { CreateConditionForm } from "@/components/forms/ajustes/CreateConditionForm";
import { Condition } from "@/types";
import { Plus } from "lucide-react";

interface CreateConditionDialogProps {
  onSuccess?: (condition: Condition) => void;
  triggerButton?: React.ReactNode;
}

export function CreateConditionDialog({
  onSuccess,
  triggerButton,
}: CreateConditionDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <ActionTriggerButton>
            <Plus className="h-4 w-4 mr-2" />
            Crear condición
          </ActionTriggerButton>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle data-tour="condiciones-dialog-header">
            Creación de Condición
          </DialogTitle>
          <DialogDescription>
            Cree una condición para los artículos del almacén.
          </DialogDescription>
        </DialogHeader>
        <CreateConditionForm
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
