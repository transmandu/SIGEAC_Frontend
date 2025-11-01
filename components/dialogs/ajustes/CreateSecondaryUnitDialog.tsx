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
import CreateSecondaryUnitForm from "@/components/forms/ajustes/CreateSecondaryUnitForm"

export function CreateSecondaryUnitDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Unidad Secundaria</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <CreateSecondaryUnitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
