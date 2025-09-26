'use client'

import CreateFlightControlForm from "@/components/forms/mantenimiento/ordenes_trabajo/CreateFlightControlForm"
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

export function CreateFlightControlDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Creación de Vuelo</DialogTitle>
          <DialogDescription>
            Cree un vuelo rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateFlightControlForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
