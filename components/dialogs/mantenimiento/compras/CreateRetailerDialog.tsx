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
import CreateRetailerForm from "@/components/forms/general/CreateRetailerForm"

export function CreateRetailerDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>Creación de Comercio</DialogTitle>
          <DialogDescription>
            Registre un comercio o lugar de compra (tienda física o en línea) rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateRetailerForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
