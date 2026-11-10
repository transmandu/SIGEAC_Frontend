"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus, BriefcaseBusiness } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateJobTitleForm } from "@/components/forms/general/CreateJobTitleForm";

export function CreateJobTitleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear cargo
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={BriefcaseBusiness}
        title="Crear Cargo"
        description="Registre el nombre del cargo y, si quiere, qué hace."
        className="sm:max-w-105"
      >
        <CreateJobTitleForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </FormDialogContent>
    </Dialog>
  );
}
