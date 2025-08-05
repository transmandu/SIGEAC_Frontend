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
import CreateSecondaryUnitForm from "../forms/ajustes/CreateSecondaryUnitForm"

export function CreateSecondaryUnitDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Unidad Secundaria</DialogTitle>
          <DialogDescription>
            Cree una unidad secundaria rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateSecondaryUnitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
