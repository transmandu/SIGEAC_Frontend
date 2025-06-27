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
import { CreateDepartmentForm } from '@/components/forms/CreateDepartmentForm';

export function CreateDepartmentDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Departamento</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Departamento</DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo departamento.
          </DialogDescription>
        </DialogHeader>

        <CreateDepartmentForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
