'use client'

import { Plus } from "lucide-react";

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
import CreateRetailerForm from "@/components/forms/general/CreateRetailerForm"

export function CreateRetailerDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear comercio
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>Creación de Comercio</DialogTitle>
          <DialogDescription>
            Registre un comercio o lugar de compra (tienda física o en línea) rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateRetailerForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
