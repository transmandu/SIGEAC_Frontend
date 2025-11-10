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
import { CreateConditionForm } from "@/components/forms/ajustes/CreateConditionForm"
import { Plus } from "lucide-react"

interface CreateConditionDialogProps {
  onSuccess?: (condition: any) => void,
  triggerButton?: React.ReactNode,
}

export function CreateConditionDialog({ 
  onSuccess, 
  triggerButton 
}: CreateConditionDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button 
            onClick={() => setOpen(true)} 
            variant={'outline'} 
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Condicion (Articulo)</DialogTitle>
          <DialogDescription>
            Cree una condicion para un articulo.
          </DialogDescription>
        </DialogHeader>
        <CreateConditionForm 
          onClose={() => setOpen(false)} 
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
