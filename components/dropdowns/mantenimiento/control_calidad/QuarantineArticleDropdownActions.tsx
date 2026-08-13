'use client'

import { useRejectReinspection } from "@/actions/mantenimiento/control_calidad/cuarentena/actions"
import { QuarantineCycleHistory } from "@/app/[company]/compras/(aeronautico)/cuarentena/_components/QuarantineCycleHistory"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCompanyStore } from "@/stores/CompanyStore"
import type { QuarantineRecord } from "@/types/quarantine"
import { ClipboardCheck, History, Loader2, MoreHorizontal, ShieldX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const MIN_REASON_LENGTH = 5

/**
 * Acciones del inspector sobre un artículo retenido. El re-incoming solo
 * aparece cuando compras ya declaró la corrección (PENDING_REINSPECTION): sobre
 * un artículo que nadie tocó no hay nada nuevo que inspeccionar, y ofrecerlo era
 * justo lo que dejaba el ciclo sin cerrar.
 */
const QuarantineArticleDropdownActions = ({ record }: { record: QuarantineRecord }) => {
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()
  const { rejectReinspection } = useRejectReinspection()

  const [historyOpen, setHistoryOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")

  const canReinspect = record.status === "PENDING_REINSPECTION"
  const reasonIsValid = reason.trim().length >= MIN_REASON_LENGTH

  const handleReject = async () => {
    if (!reasonIsValid) return

    await rejectReinspection.mutateAsync({ id: record.id, reason: reason.trim() })

    setReason("")
    setRejectOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="flex justify-center gap-2">
          {canReinspect && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-green-600 transition-colors hover:text-green-800"
                    onClick={() =>
                      router.push(
                        `/${selectedCompany?.slug}/control_calidad/incoming/${record.article_id}`,
                      )
                    }
                  >
                    <ClipboardCheck className="size-5" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Re-inspeccionar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 transition-colors hover:text-red-800"
                    onClick={() => setRejectOpen(true)}
                  >
                    <ShieldX className="size-5" />
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>Rechazar corrección</TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="size-5" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Ver historial</TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* HISTORIAL */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5" />
              Historial de cuarentena
            </DialogTitle>
            <DialogDescription>
              {record.article?.part_number ?? "Artículo"} — todas las retenciones y
              correcciones sobre este artículo.
            </DialogDescription>
          </DialogHeader>

          <QuarantineCycleHistory cycles={record.cycles ?? []} />
        </DialogContent>
      </Dialog>

      {/* RECHAZO DE LA CORRECCIÓN */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-center">
              Rechazar corrección <ShieldX className="size-5 text-red-500" />
            </DialogTitle>
            <DialogDescription className="text-center">
              El artículo vuelve a cuarentena con un motivo nuevo. El plazo legal no se
              reinicia: sigue corriendo desde la retención original.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Nuevo hallazgo</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              placeholder="Describa por qué la corrección no cumple."
            />
            {!reasonIsValid && reason.length > 0 && (
              <p className="text-xs text-destructive">
                Mínimo {MIN_REASON_LENGTH} caracteres para justificar el rechazo.
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            {reasonIsValid && (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectReinspection.isPending}
              >
                {rejectReinspection.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <p>Devolver a cuarentena</p>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QuarantineArticleDropdownActions
