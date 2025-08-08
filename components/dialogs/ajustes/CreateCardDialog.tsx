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
import CreateCardForm from "@/components/forms/ajustes/CreateCardForm"

export function CreateCardDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Registrar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Registro de Tarjeta</DialogTitle>
          <DialogDescription>
            Registre una tarjeta rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateCardForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
