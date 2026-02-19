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
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, X, Pencil } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import type { IArticleSimple } from "../_tables/warehouse-columns"
import { getStatusBadge } from "../_tables/warehouse-columns"
import { formatCondition } from "@/lib/warehouse/conditions"

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
    blob: `${serialOrLot} ${desc} ${status} ${zone} ${shelf}`.toLowerCase(),
  }
}

function formatShelf(r: IArticleSimple) {
  const shelf =
    r.component?.expiration_date ||
    (typeof r.consumable?.expiration_date === "string"
      ? r.consumable.expiration_date
      : r.consumable?.expiration_date instanceof Date
        ? r.consumable.expiration_date.toISOString()
        : null)

  return shelf ? String(shelf).slice(0, 10) : null
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

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const router = useRouter()
  const params = useParams()
  const company = String((params as any)?.company ?? "")

  const goEdit = React.useCallback(
    (articleId: string | number) => {
      if (!company) return
      router.push(`/${company}/almacen/inventario_articulos/editar/${articleId}`)
    },
    [router, company]
  )

  /**
   * 7 columnas (incluye acciones):
   * Serial | Descripción | Condición | Estado | Ubicación | Vencimiento | Acciones
   *
   * Bajé el ancho de descripción para que no absorba todo.
   */
  const gridCols =
    "[grid-template-columns:150px_260px_120px_140px_160px_160px_64px]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden w-[min(1200px,96vw)] sm:max-w-none flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-5 border-b">
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
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-4 flex-1 min-h-0">
          {!count ? (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <>
              <Separator className="mb-4" />

              {!shown ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-sm text-muted-foreground">Prueba con otro término de búsqueda.</p>
                </div>
              ) : (
                /**
                 * ✅ Scroll nativo (X e Y) en un solo contenedor.
                 * Esto hace que SIEMPRE aparezca el scroll horizontal cuando haga falta.
                 */
                <div className="h-full max-h-[55vh] overflow-x-auto overflow-y-auto pr-2">
                  {/* Fuerza overflow horizontal real */}
                  <div className="min-w-[980px] rounded-md border overflow-hidden">
                    {/* Header tabla */}
                    <div
                      className={cn(
                        "grid",
                        gridCols,
                        "bg-muted/40 text-xs font-semibold text-muted-foreground"
                      )}
                    >
                      <div className="px-3 py-2">Serial / Lote</div>
                      <div className="px-3 py-2">Descripción</div>
                      <div className="px-3 py-2 text-center">Condición</div>
                      <div className="px-3 py-2 text-center">Estado</div>
                      <div className="px-3 py-2 text-center">Ubicación</div>
                      <div className="px-3 py-2 text-center">Vencimiento</div>
                      <div className="px-3 py-2 text-center">Acciones.</div>
                    </div>

                    <div className="divide-y">
                      {filtered.map((r) => {
                        const serialOrLot = r.serial || r.lot_number || "N/A"
                        const desc = r.batch_name || r.description || "Sin descripción"
                        const shelf = formatShelf(r)

                        return (
                          <div key={r.id} className={cn("grid", gridCols, "items-center hover:bg-muted/30")}>
                            <div className="px-3 py-2 text-sm font-medium truncate">{serialOrLot}</div>

                            <div className="px-3 py-2 text-sm text-muted-foreground truncate">{desc}</div>

                            <div className="px-3 py-2 text-center text-sm">
                              {(() => {
                                  const c = formatCondition(r.condition as any)
                                  if (!c) return <span className="text-muted-foreground text-sm">N/A</span>

                                  return (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="text-base font-medium">{c.es}</span>
                                      <span className="text-xs text-muted-foreground italic">({c.en})</span>
                                    </div>
                                  )
                                })()}
                            </div>

                            <div className="px-3 py-2 flex justify-center">
                              {getStatusBadge(r.status?.toUpperCase())}
                            </div>

                            <div className="px-3 py-2 text-center text-sm font-medium">
                              {r.zone || <span className="text-muted-foreground">N/A</span>}
                            </div>

                            <div className="px-3 py-2 flex justify-center">
                              {shelf ? (
                                <Badge variant="secondary" className="text-xs">
                                  {shelf}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                              )}
                            </div>

                            {/* Acciones (solo icono) */}
                            <div className="px-3 py-2 flex justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => goEdit(r.id)}
                                aria-label="Editar artículo"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t shrink-0">
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
