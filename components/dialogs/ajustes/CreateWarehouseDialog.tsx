"use client"

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";

import { useState } from "react"
import { Plus } from "lucide-react"
import CreateWarehouseForm from "@/components/forms/ajustes/CreateWarehouseForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const CreateWarehouseDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear almacén
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle>Creación de Almacén</DialogTitle>
          <DialogDescription>
            Cree un almacén rellenando los datos necesarios.
          </DialogDescription>
        </DialogHeader>
        <CreateWarehouseForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateWarehouseDialog
