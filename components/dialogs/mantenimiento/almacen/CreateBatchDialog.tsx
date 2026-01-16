'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useState } from "react"
import { CreateBatchForm } from "@/components/forms/mantenimiento/almacen/CreateBatchForm"

interface CreateBatchDialogProps {
  onSuccess?: (batchName: string) => void
  triggerButton?: React.ReactNode
  defaultCategory?: string
}

export function CreateBatchDialog({ 
  onSuccess, 
  triggerButton,
  defaultCategory 
}: CreateBatchDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button onClick={() => setOpen(true)} variant={'ghost'}>Crear Renglón</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Creación de Renglón</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <CreateBatchForm 
          onClose={() => setOpen(false)} 
          onSuccess={(batchName) => {
            if (onSuccess) {
              onSuccess(batchName);
            }
            setOpen(false);
          }}
          defaultCategory={defaultCategory}
        />
      </DialogContent>
    </Dialog>
  )
}
