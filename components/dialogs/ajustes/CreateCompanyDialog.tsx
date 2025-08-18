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
import { CreateCompanyForm } from "@/components/forms/general/CreateCompanyForm"

export function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Creación de Empresa</DialogTitle>
          <DialogDescription>
            Cree una empresa rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateCompanyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
