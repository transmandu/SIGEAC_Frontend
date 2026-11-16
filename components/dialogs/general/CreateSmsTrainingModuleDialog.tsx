"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CreateSmsTrainingModuleForm } from "@/components/forms/general/CreateSmsTrainingModuleForm";

export function CreateSmsTrainingModuleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear módulo
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={BookOpen}
        title="Crear módulo"
        description="Registra un módulo del catálogo global de capacitación."
        className="sm:max-w-120"
      >
        <CreateSmsTrainingModuleForm onSuccess={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
