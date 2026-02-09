"use client"

import * as React from "react"
import Image from "next/image"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, PackageOpen, Hash, Barcode, X } from "lucide-react"

type Article = {
  description?: string
  serial?: string
  dispatch_quantity: string
  part_number?: string
  article_id?: string | number
  unit?: string
}

interface DispatchArticlesDialogProps {
  articles?: Article[]
  work_order?: string
}

function formatQty(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "0.00"
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const DispatchArticlesDialog = ({ articles = [], work_order }: DispatchArticlesDialogProps) => {
  const hasArticles = articles.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Ver artículos
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 overflow-hidden sm:max-w-lg">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="leading-tight flex flex-col gap-2">
                  <span>Artículos despachados </span>
                  <span className="text-muted-foreground font-normal">
                    {work_order ? `· WO ${work_order}` : "· WO N/A"}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {hasArticles
                    ? `${articles.length} ítem(s)`
                    : "No hay artículos para mostrar."}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Image
                src="/h74_logo.png"
                width={44}
                height={44}
                alt="logo"
                className="h-11 w-11 rounded-md border object-contain bg-white"
              />

              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4">
          {!hasArticles ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full border bg-muted/40 p-3">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sin artículos</p>
                <p className="text-sm text-muted-foreground">
                  Cuando haya despacho, aparecerá la lista aquí.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Separator className="mb-4" />

              <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-2">
                  {articles.map((a, idx) => {
                    const key =
                      a.article_id ??
                      a.part_number ??
                      a.serial ??
                      `${a.description ?? "item"}-${idx}`;

                    const title =
                      a.part_number !== "N/A"
                        ? a.part_number?.trim() ||
                          a.description?.trim() ||
                          "Artículo sin identificar"
                        : a.description?.trim() || "Artículo sin identificar";
                    const hasPnTitle =
                      !!a.part_number?.trim() &&
                      a.part_number?.trim() !== "N/A";

                    return (
                      <div
                        key={key}
                        className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {/* ✅ Título: PN si existe, si no Descripción */}
                            <p className="truncate text-sm font-medium">
                              {title}
                            </p>

                            {/* ✅ Si el título es PN y hay descripción, mostrarla como subtítulo */}
                            {hasPnTitle &&
                              a.description?.trim() &&
                              a.description !== "N/A" && (
                                <p className="mt-1 text-xs text-muted-foreground truncate">
                                  {a.description.trim()}
                                </p>
                              )}
                            {(a.part_number || a.serial) && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {a.part_number && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Hash className="h-3.5 w-3.5" />
                                    <span className="font-normal">
                                      {a.part_number}
                                    </span>
                                  </Badge>
                                )}
                                {a.serial && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Barcode className="h-3.5 w-3.5" />
                                    <span className="font-normal">
                                      {a.serial}
                                    </span>
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Badge className="text-sm">
                              {formatQty(a.dispatch_quantity)}
                              {a.unit ? ` ${a.unit}` : ""}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DispatchArticlesDialog
