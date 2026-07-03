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
import CreateBankAccountForm from "@/components/forms/ajustes/CreateBankAccountForm"
import { useAuth } from "@/contexts/AuthContext"

export function CreateBankAccountDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  // La gestión de cuentas (incluida su habilitación por compañía) es
  // exclusiva de ADMINISTRAC (el backend también lo exige).IÓN
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
      <DialogContent className="sm:max-w-[420px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Creación de Cuenta Bancaria</DialogTitle>
          <DialogDescription>
            Cree una cuenta rellenando la información necesaria y habilítela para una o varias compañías.
          </DialogDescription>
        </DialogHeader>
        <CreateBankAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
