'use client'

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { ConsumableDispatchForm } from "@/components/forms/mantenimiento/almacen/ConsumableDispatchRequestForm"
import { ToolDispatchForm } from "@/components/forms/mantenimiento/almacen/ToolDispatchForm"
import { ComponentDispatchForm } from "@/components/forms/mantenimiento/almacen/ComponentDispatchForm"
import { PartDispatchForm } from "@/components/forms/mantenimiento/almacen/PartDispatchForm"
import { Drill, Package2, PaintBucket, Puzzle } from "lucide-react"

const CATEGORIES = [
  { value: "consumible", label: "Consumible", icon: PaintBucket },
  { value: "componente", label: "Componente", icon: Package2 },
  { value: "parte", label: "Parte", icon: Puzzle },
  { value: "herramienta", label: "Herramienta", icon: Drill },
]

export function RegisterDispatchRequestDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // Radix desmonta el contenido al cerrar y el formulario se limpia solo,
        // pero la categoría vive aquí: sin reiniciarla, al reabrir aparece el
        // formulario de la salida anterior en vez del estado inicial.
        if (!next) setCategory(null)
      }}
    >
      <DialogTrigger asChild>
        <ActionTriggerButton className="flex items-center justify-center gap-2">
          Registrar Salida
        </ActionTriggerButton>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-3rem)] max-w-4xl flex-col overflow-hidden">
        {/* pr-8: el botón de cerrar del Dialog va posicionado absoluto sobre
            esta esquina y taparía el selector. */}
        <DialogHeader className="shrink-0 pr-8">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-2xl">Registro de Salida</DialogTitle>
              <DialogDescription className="mt-1">
                Registre la salida de material del almacén.
              </DialogDescription>
            </div>
            <div className="shrink-0 space-y-1.5">
              <label htmlFor="dispatch-category" className="text-sm font-medium">
                Tipo de artículo
              </label>
              <Select value={category ?? ""} onValueChange={setCategory}>
                <SelectTrigger id="dispatch-category" className="h-9 w-[190px]">
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent align="end">
                  {CATEGORIES.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        {category && (
          <div className="min-w-0 flex-1 overflow-y-auto px-1 py-1">
            {category === 'consumible' && (
              <ConsumableDispatchForm key="consumible" onClose={() => setOpen(false)} />
            )}
            {category === 'herramienta' && (
              <ToolDispatchForm key="herramienta" onClose={() => setOpen(false)} />
            )}
            {category === 'componente' && (
              <ComponentDispatchForm key="componente" onClose={() => setOpen(false)} />
            )}
            {category === 'parte' && (
              <PartDispatchForm key="parte" onClose={() => setOpen(false)} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
