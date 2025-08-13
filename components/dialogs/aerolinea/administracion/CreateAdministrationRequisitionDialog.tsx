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
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { CreateAdministrationRequisitionForm } from "@/components/forms/aerolinea/administracion/CreateAdministrationRequisitionForm"

export function CreateAdministrationRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nueva Req.</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Solicitar Requisición</DialogTitle>
          <DialogDescription>
            Solicite una requisición mediante el siguiente formulario
          </DialogDescription>
        </DialogHeader>
        <CreateAdministrationRequisitionForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
