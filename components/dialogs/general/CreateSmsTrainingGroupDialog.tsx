"use client";

import { useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { CreateSmsTrainingGroupForm } from "@/components/forms/general/CreateSmsTrainingGroupForm";

export function CreateSmsTrainingGroupDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear grupo
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={UsersRound}
        title="Crear grupo de capacitación"
        description="Agrupa cargos para inscribir participantes en bloque en los cursos."
        className="sm:max-w-120"
      >
        <CreateSmsTrainingGroupForm onSuccess={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
