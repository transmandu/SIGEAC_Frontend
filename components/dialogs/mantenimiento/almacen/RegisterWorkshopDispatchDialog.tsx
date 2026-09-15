'use client'

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useState } from "react"
import { WorkshopDispatchForm } from "@/components/forms/mantenimiento/almacen/salida_taller/WorkshopDispatchForm"

export function RegisterWorkshopDispatchDialog() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton className="flex items-center justify-center gap-2">
          Registrar Salida a Taller
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-3rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl">Salida a Taller</DialogTitle>
          <DialogDescription>
            Registre la salida de artículos hacia un taller externo para reparación u overhaul.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 flex-1 overflow-y-auto px-1 py-1">
          <WorkshopDispatchForm onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
