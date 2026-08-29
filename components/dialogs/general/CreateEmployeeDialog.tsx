'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { CreateEmployeeForm } from '@/components/forms/general/CreateEmployeeForm';

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
<ActionTriggerButton className="flex items-center justify-center gap-2">
  Crear Empleado
</ActionTriggerButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crear Empleado</DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo empleado.
          </DialogDescription>
        </DialogHeader>
        <CreateEmployeeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
