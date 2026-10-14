"use client";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { AuthorizedEmployeeForm } from "@/components/forms/ajustes/CreateAuthorizedEmployeed";

export function CreateAuthorizedEmployeeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear autorización
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Autorizar empleado</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AuthorizedEmployeeForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
