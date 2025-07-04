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
import { Button } from '@/components/ui/button';

import { CreateEmployeeForm } from '../forms/CreateEmployeeForm';

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Empleado</Button>
      </DialogTrigger>

      <DialogContent>
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
