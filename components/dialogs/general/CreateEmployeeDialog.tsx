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
        description="Registre a la persona, su contacto y dónde trabaja; si va a iniciar sesión, dele acceso al sistema."
        className="sm:max-w-3xl"
      >
        <CreateEmployeeForm onSuccess={() => setOpen(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
