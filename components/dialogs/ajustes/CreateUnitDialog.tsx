"use client";

import { Plus } from "lucide-react";

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
import CreateUnitForm from "@/components/forms/ajustes/CreateUnitForm";

export function CreateUnitDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear unidad
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Creación de Unidad</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <CreateUnitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
