"use client";

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Crear Cargo</DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo cargo.
          </DialogDescription>
        </DialogHeader>

        <CreateJobTitleForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
