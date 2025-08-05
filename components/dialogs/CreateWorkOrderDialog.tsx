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

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nueva Ord. de Trabajo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Ord. de Trabajo</DialogTitle>
          <DialogDescription>
            Genere una orden rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateCompanyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
