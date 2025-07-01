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
import { CreateRequisitionForm } from "../forms/mantenimiento/compras/CreateRequisitionForm"
import { useAuth } from "@/contexts/AuthContext"
import { CreateGeneralRequisitionForm } from "../forms/mantenimiento/compras/CreateGeneralRequisitionForm"

export function CreateRequisitionDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false);

  const userRoles = user?.roles?.map(role => role.name) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nueva Req.</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Creación de Requisición</DialogTitle>
          <DialogDescription>
            Genere una requisición mediante el siguiente formulario
          </DialogDescription>
        </DialogHeader>
        {
          userRoles.includes("INGENIERO") ? <CreateRequisitionForm onClose={() => setOpen(false)} /> : <CreateGeneralRequisitionForm isEditing={false} onClose={() => setOpen(false)} />
        }
      </DialogContent>
    </Dialog>
  )
}
