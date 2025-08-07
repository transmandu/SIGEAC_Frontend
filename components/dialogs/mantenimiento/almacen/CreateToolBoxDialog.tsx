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
import { CreateToolBoxForm } from "@/components/forms/mantenimiento/almacen/CreateToolBoxForm"

export function CreateToolBoxDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Caja de Herra.</DialogTitle>
          <DialogDescription>
            Cree una caja de herramientas y asignela a un técnico.
          </DialogDescription>
        </DialogHeader>
        <CreateToolBoxForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
