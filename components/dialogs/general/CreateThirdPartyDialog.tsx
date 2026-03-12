'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react"
import CreateThirdPartyForm from "@/components/forms/general/CreateThirdPartyForm"

export function CreateThirdPartyDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Nuevo Tercero
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Tercero</DialogTitle>
          <DialogDescription>
            Cree un tercero rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateThirdPartyForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
