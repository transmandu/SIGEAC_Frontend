'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import CreateMaintenanceProviderForm from "@/components/forms/mantenimiento/planificacion/CreateMaintenanceProviderForm"
import { Plus } from "lucide-react"
import { MaintenanceProvider } from "@/types"

interface CreateMaintenanceProviderDialogProps {
  onSuccess?: (provider: MaintenanceProvider) => void
}

export function CreateMaintenanceProviderDialog({ onSuccess }: CreateMaintenanceProviderDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs border-dashed">
          <Plus className="size-3.5" />
          Nueva Entidad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Registrar Entidad</DialogTitle>
          <DialogDescription>
            Registre la organización o persona que realiza los servicios de mantenimiento.
          </DialogDescription>
        </DialogHeader>
        <CreateMaintenanceProviderForm
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
