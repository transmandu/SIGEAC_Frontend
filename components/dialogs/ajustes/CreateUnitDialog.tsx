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
import CreateUnitForm from "@/components/forms/ajustes/CreateUnitForm"

export function CreateUnitDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Unidad</DialogTitle>
          <DialogDescription>
            Cree una unidad rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateUnitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
