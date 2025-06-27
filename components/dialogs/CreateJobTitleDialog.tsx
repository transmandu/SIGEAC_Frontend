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
import { CreateJobTitleForm } from '@/components/forms/CreateJobTitleForm';

export function CreateJobTitleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Cargo</Button>
      </DialogTrigger>

      <DialogContent>
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
