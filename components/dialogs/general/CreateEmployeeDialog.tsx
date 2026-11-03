"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Plus, UserRound } from "lucide-react";

import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { CreateEmployeeForm } from "@/components/forms/general/CreateEmployeeForm";

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear empleado
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={UserRound}
        title="Crear Empleado"
        description="Completa la información para registrar un nuevo empleado."
        className="sm:max-w-5xl"
      >
        <CreateEmployeeForm onSuccess={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
