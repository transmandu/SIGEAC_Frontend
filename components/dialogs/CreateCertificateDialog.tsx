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
import { CreateCertificateForm } from "../forms/mantenimiento/ordenes_trabajo/CreateCertificateForm"

export function CreateCertificateDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Certificado</DialogTitle>
          <DialogDescription>
            Cree un certificado rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateCertificateForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
