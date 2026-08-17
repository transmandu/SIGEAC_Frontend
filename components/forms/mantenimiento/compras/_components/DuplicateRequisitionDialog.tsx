"use client"

import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ActiveGeneralArticleRequisition } from "@/types/purchase"
import { ActiveRequisitionWarning } from "./ActiveRequisitionWarning"

export interface DuplicateRequisitionConflict {
  label: string
  entries: ActiveGeneralArticleRequisition[]
}

/** Último aviso antes de repetir un pedido. Confirma, no bloquea. */
export function DuplicateRequisitionDialog({
  conflicts,
  open,
  onOpenChange,
  onConfirm,
}: {
  conflicts: DuplicateRequisitionConflict[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500" />
            ¿Solicitar de todos modos?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {conflicts.length === 1
              ? "Este artículo ya fue solicitado y su requisición sigue abierta."
              : "Estos artículos ya fueron solicitados y sus requisiciones siguen abiertas."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className={conflicts.length > 3 ? "h-[280px] pr-3" : ""}>
          <div className="flex flex-col gap-3">
            {conflicts.map((conflict) => (
              <div key={conflict.label} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{conflict.label}</p>
                <ActiveRequisitionWarning entries={conflict.entries} />
              </div>
            ))}
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <AlertDialogCancel>Revisar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Solicitar igual</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
