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
import { CreateCompanyForm } from "../forms/general/CreateCompanyForm"
import CreateManufacturerForm from "../forms/general/CreateManufacturerForm"

export function CreateManufacturerDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Fabricante</DialogTitle>
          <DialogDescription>
            Cree un fabricante rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateManufacturerForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
