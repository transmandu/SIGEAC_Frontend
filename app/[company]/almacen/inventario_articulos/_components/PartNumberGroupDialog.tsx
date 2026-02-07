"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import type { IArticleSimple } from "../_tables/warehouse-columns"
import { getStatusBadge } from "../_tables/warehouse-columns"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  partNumber: string
  rows: IArticleSimple[]
}

function toSearchable(r: IArticleSimple) {
  const serialOrLot = r.serial || r.lot_number || ""
  const desc = r.batch_name || r.description || ""
  const status = (r.status || "").toUpperCase()
  const zone = r.zone || ""

  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? r.consumable.expiration_date.toISOString()
        : "")

  return {
    serialOrLot,
    desc,
    status,
    zone,
    shelf: shelf || "",
    blob: `${serialOrLot} ${desc} ${status} ${zone} ${shelf}`.toLowerCase(),
  }
}

export function PartNumberGroupDialog({ open, onOpenChange, partNumber, rows }: Props) {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  const filtered = React.useMemo(() => {
    if (!q) return rows
    return rows.filter((r) => toSearchable(r).blob.includes(q))
  }, [rows, q])

  const count = rows?.length ?? 0
  const shown = filtered?.length ?? 0

  // Reset search when closing
  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="w-full space-y-3">
              <DialogTitle className="leading-tight text-3xl flex justify-center w-full">
                Artículos del PN{" "}
                #<span className="font-bold text-blue-800">{partNumber}</span>
              </DialogTitle>

              <DialogDescription className="flex items-center justify-between gap-3">
                <span>
                  {count ? `${count} unidad(es) encontradas` : "No hay artículos para mostrar."}
                  {count > 0 && q && (
                    <span className="text-muted-foreground">
                      {" "}
                      • Mostrando <span className="font-medium text-foreground">{shown}</span>
                    </span>
                  )}
                </span>
              </DialogDescription>

              {/* Buscador */}
              {count > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por serial, lote, descripción, ubicación, estado o fecha..."
                    className="pl-9 pr-9 h-10"
                  />
                  {!!query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2",
                        "h-7 w-7 inline-flex items-center justify-center rounded-md",
                        "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {!count ? (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <>
              <Separator className="mb-4" />

              {!shown ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-sm text-muted-foreground">
                    Prueba con otro término de búsqueda.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-3">
                  <div className="rounded-md border overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/40 text-xs font-semibold text-muted-foreground">
                      <div className="col-span-3 px-3 py-2">Serial / Lote</div>
                      <div className="col-span-3 px-3 py-2">Descripción</div>
                      <div className="col-span-2 px-3 py-2 text-center">Estado</div>
                      <div className="col-span-2 px-3 py-2 text-center">Ubicación</div>
                      <div className="col-span-2 px-3 py-2 text-center">Shelf Life</div>
                    </div>

                    <div className="divide-y">
                      {filtered.map((r) => {
                        const serialOrLot = r.serial || r.lot_number || "N/A"
                        const desc = r.batch_name || r.description || "Sin descripción"

                        const shelf =
                          r.component?.expiration_date ||
                          (typeof r.consumable?.expiration_date === "string"
                            ? r.consumable.expiration_date
                            : r.consumable?.expiration_date instanceof Date
                              ? r.consumable.expiration_date.toISOString()
                              : null)

                        return (
                          <div key={r.id} className="grid grid-cols-12 items-center hover:bg-muted/30">
                            <div className="col-span-3 px-3 py-2 text-sm font-medium truncate">
                              {serialOrLot}
                            </div>

                            <div className="col-span-3 px-3 py-2 text-sm text-muted-foreground truncate">
                              {desc}
                            </div>

                            <div className="col-span-2 px-3 py-2 flex justify-center">
                              {getStatusBadge(r.status?.toUpperCase())}
                            </div>

                            <div className="col-span-2 px-3 py-2 text-center text-sm font-medium">
                              {r.zone || <span className="text-muted-foreground">N/A</span>}
                            </div>

                            <div className="col-span-2 px-3 py-2 flex justify-center">
                              {shelf ? (
                                <Badge variant="secondary" className="text-xs">
                                  {String(shelf).slice(0, 10)}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
