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
import CreateManufacturerForm from "@/components/forms/general/CreateManufacturerForm"
import { Plus } from "lucide-react"

interface CreateManufacturerDialogProps {
  defaultType?: "AIRCRAFT" | "ENGINE" | "APU" | "PROPELLER" | "GENERAL" | "PART",
  onSuccess?: (manufacturer: any) => void,
  triggerButton?: React.ReactNode,
}

export function CreateManufacturerDialog({ 
  defaultType = "GENERAL", 
  onSuccess, 
  triggerButton 
}: CreateManufacturerDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button 
            onClick={() => setOpen(true)} 
            variant={'outline'} 
            className="flex items-center justify-center gap-2 h-8 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Creación de Fabricante</DialogTitle>
          <DialogDescription>
            Cree un fabricante rellenando la información necesaria.
          </DialogDescription>
        </DialogHeader>
        <CreateManufacturerForm 
          onClose={() => setOpen(false)} 
          defaultType={defaultType}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
