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
import { CreateConditionForm } from "../forms/ajustes/CreateConditionForm"

export function CreateConditionDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Crear</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Condicion (Articulo)</DialogTitle>
          <DialogDescription>
            Cree una condicion para un articulo.
          </DialogDescription>
        </DialogHeader>
        <CreateConditionForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
