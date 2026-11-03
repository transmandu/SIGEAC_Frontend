"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { CreateConditionForm } from "@/components/forms/ajustes/CreateConditionForm";
import { Condition } from "@/types";
import { Plus, BadgeCheck } from "lucide-react";

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
      <FormDialogContent
        icon={BadgeCheck}
        title="Creación de Condición"
        description="Cree una condición para los artículos del almacén."
        tourId="condiciones-dialog-header"
        className="sm:max-w-lg"
      >
        <CreateConditionForm
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
        />
      </FormDialogContent>
    </Dialog>
  );
}
