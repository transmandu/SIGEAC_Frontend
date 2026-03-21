"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm"

export function CreateShippingAgencyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Crear
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Creación de Agencia de Envío</DialogTitle>
          <DialogDescription>
            Complete el formulario a continuación para agregar una nueva agencia de envío.
          </DialogDescription>
        </DialogHeader>

        <CreateShippingAgencyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}