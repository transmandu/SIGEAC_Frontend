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
import CreateBankForm from "@/components/forms/ajustes/CreateBankForm"
import { useAuth } from "@/contexts/AuthContext"

export function CreateBankDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // La gestión de bancos es exclusiva de ADMINISTRACIÓN (el backend también lo exige).
  const ALLOWED_ROLES = ["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"];

  const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role.name));

  if (!hasAccess) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Banco</DialogTitle>
          <DialogDescription>
            Cree un rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateBankForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
