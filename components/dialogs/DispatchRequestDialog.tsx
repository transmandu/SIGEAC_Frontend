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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ConsumableDispatchForm } from "../forms/mantenimiento/almacen/ConsumableDispatchRequestForm"
import { ToolDispatchForm } from "../forms/mantenimiento/almacen/ToolDispatchForm"
import { ComponentDispatchForm } from "../forms/mantenimiento/almacen/ComponentDispatchForm"


export function DispatchRequestDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Solicitar Salida</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Solicitud de Salida</DialogTitle>
          <DialogDescription>
            {
              category ? `Rellene el formulario para ${category}.` : "Seleccione una categoria..."
            }
          </DialogDescription>
        </DialogHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"sm"} className="w-[130px]">
              {
                category ? category.toUpperCase() : <span className="text-muted-foreground">Seleccionar tipo...</span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCategory("consumible")}>
              Consumible
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategory("componente")}>
              Componente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategory("herramienta")}>
              Herramienta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {
          category === 'consumible' && <ConsumableDispatchForm onClose={() => setOpen(false)} />
        }
        {
          category === 'herramienta' && <ToolDispatchForm onClose={() => setOpen(false)} />
        }
        {
          category === 'componente' && <ComponentDispatchForm onClose={() => setOpen(false)} />
        }
      </DialogContent>
    </Dialog>
  )
}
