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
import { PartDispatchForm } from "@/components/forms/mantenimiento/almacen/PartDispatchForm"
import { ChevronDown } from "lucide-react"


export function RegisterDispatchRequestDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hovered) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
          variant="outline"
          className="relative overflow-hidden flex items-center justify-center gap-2 border border-dashed border-slate-400/50 dark:border-slate-400/30 bg-white/60 dark:bg-slate-900/30 backdrop-blur text-slate-800 dark:text-slate-200 font-medium tracking-wide shadow-sm transition-all duration-200 hover:border-blue-400/60 dark:hover:border-blue-300/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-2 before:absolute before:inset-0 before:pointer-events-none before:transition-opacity before:duration-300"
          style={{
            backgroundImage: hovered
              ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(59,130,246,0.12), rgba(99,102,241,0.06), transparent 70%)`
              : 'none'
          }}
        >
          Registrar Salida
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Registro de Salida</DialogTitle>
              <DialogDescription className="mt-2">
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
                  onClick={() => setCategory("parte")}
                  className={category === "parte" ? "bg-accent" : ""}
                >
                  Parte
                  {category === "parte" && <span className="ml-auto text-xs">✓</span>}
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
            {
              category === 'parte' && (
                <PartDispatchForm 
                  key="parte" 
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
