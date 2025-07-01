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
import CreateBankAccountForm from "../forms/ajustes/CreateBankAccountForm"

export function CreateBankAccountDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Nuevo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Creación de Banco</DialogTitle>
          <DialogDescription>
            Cree un rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateBankAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
