"use client";

import { useState } from "react";
import { Layers3, Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CreateSmsTrainingModulePatternForm } from "@/components/forms/general/CreateSmsTrainingModulePatternForm";

export function CreateSmsTrainingModulePatternDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear patrón
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={Layers3}
        title="Crear patrón de módulos"
        description="Define los módulos y las horas del curso inicial. El recurrente usa la mitad."
        className="sm:max-w-150"
      >
        <CreateSmsTrainingModulePatternForm onSuccess={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
