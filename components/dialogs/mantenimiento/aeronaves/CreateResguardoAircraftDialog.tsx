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
import { CreateResguardoAircraftForm } from "@/components/forms/mantenimiento/aeronaves/CreateResguardoAircraftForm"
import { Plus } from "lucide-react"

interface CreateResguardoAircraftDialogProps {
  onSuccess?: (aircraftId: string) => void
  triggerButton?: React.ReactNode
}

export function CreateResguardoAircraftDialog({ 
  onSuccess, 
  triggerButton 
}: CreateResguardoAircraftDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [key, setKey] = useState(0); // Key para forzar remount del formulario
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Cuando se cierra, incrementar key para resetear el formulario
      setKey(prev => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button onClick={() => setOpen(true)} variant={'ghost'}>
            <Plus className="h-3 w-3 mr-1" />
            Crear nueva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Registrar nueva aeronave</DialogTitle>
          <DialogDescription>
            Complete los datos de la aeronave de la que se extrajo el artículo.
          </DialogDescription>
        </DialogHeader>
        <CreateResguardoAircraftForm 
          key={key} // Key para resetear el formulario cuando cambia
          onClose={() => handleOpenChange(false)} 
          onSuccess={(aircraftId) => {
            if (onSuccess) {
              onSuccess(aircraftId);
            }
            handleOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
