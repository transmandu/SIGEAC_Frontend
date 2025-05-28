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
import AddInspectionItemForm from "../forms/AddInspectionItemForm"

export function PrelimInspectItemDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Agregar Observacion</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Agregar Observación</DialogTitle>
          <DialogDescription>
            Ingrese la información de la observación.
          </DialogDescription>
        </DialogHeader>
        <AddInspectionItemForm id={id} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
