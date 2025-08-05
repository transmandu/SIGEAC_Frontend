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
import CreateVendorForm from "../forms/general/CreateVendorForm"

export function CreateVendorDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>Creación de Proveedor</DialogTitle>
          <DialogDescription>
            Cree un proveedor rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateVendorForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
