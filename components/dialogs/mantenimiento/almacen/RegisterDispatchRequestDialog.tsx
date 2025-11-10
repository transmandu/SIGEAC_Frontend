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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { ConsumableDispatchForm } from "@/components/forms/mantenimiento/almacen/ConsumableDispatchRequestForm"
import { ToolDispatchForm } from "@/components/forms/mantenimiento/almacen/ToolDispatchForm"
import { ComponentDispatchForm } from "@/components/forms/mantenimiento/almacen/ComponentDispatchForm"
import { ChevronDown } from "lucide-react"


export function RegisterDispatchRequestDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} variant={'outline'} className="flex items-center justify-center gap-2 h-8 border-dashed">Registrar Salida</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Registro de Salida</DialogTitle>
              <DialogDescription className="mt-2">
                {
                  category ? `Rellene el formulario para ${category}.` : "Seleccione una categoría para continuar."
                }
              </DialogDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {category ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 h-8"
                  >
                    <Badge variant="default" className="text-xs px-2 py-0.5">
                      {category.toUpperCase()}
                    </Badge>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8">
                    <span className="text-muted-foreground">Seleccionar tipo...</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem 
                  onClick={() => setCategory("consumible")}
                  className={category === "consumible" ? "bg-accent" : ""}
                >
                  Consumible
                  {category === "consumible" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCategory("componente")}
                  className={category === "componente" ? "bg-accent" : ""}
                >
                  Componente
                  {category === "componente" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCategory("herramienta")}
                  className={category === "herramienta" ? "bg-accent" : ""}
                >
                  Herramienta
                  {category === "herramienta" && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>
        {category ? (
          <>
            <Separator className="my-4" />
            {
              category === 'consumible' && (
                <ConsumableDispatchForm 
                  key="consumible" 
                  onClose={() => setOpen(false)} 
                />
              )
            }
            {
              category === 'herramienta' && (
                <ToolDispatchForm 
                  key="herramienta" 
                  onClose={() => setOpen(false)} 
                />
              )
            }
            {
              category === 'componente' && (
                <ComponentDispatchForm 
                  key="componente" 
                  onClose={() => setOpen(false)} 
                />
              )
            }
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Seleccione un tipo de artículo desde el menú superior para comenzar.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
