'use client'

import { useSendToQuarantine } from "@/actions/mantenimiento/almacen/inventario/articulos/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import { Biohazard, ClipboardCheck, Loader2, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"
import { useCompanyStore } from "@/stores/CompanyStore"
import { format } from "date-fns"

const MIN_REASON_LENGTH = 5

const InReceptionDropdownActions = ({ id }: { id: number }) => {

  const [open, setOpen] = useState<boolean>(false)
  const [reason, setReason] = useState<string>("")

  const router = useRouter()
  const { selectedCompany } = useCompanyStore()
  const { user } = useAuth()

  const { sendToQuarantine } = useSendToQuarantine()

  const reasonIsValid = reason.trim().length >= MIN_REASON_LENGTH

  /**
   * Antes esto solo cambiaba el status a un valor que no existe en BD
   * ("Quarentine"), así que el artículo quedaba fuera del módulo de cuarentena
   * y sin registro: nadie sabía por qué se retuvo ni quién lo hizo. Ahora crea
   * el registro por el endpoint del ciclo, que es lo que avisa a compras.
   */
  const handleSendToQuarantine = async () => {
    if (!user || !reasonIsValid) return

    await sendToQuarantine.mutateAsync({
      article_id: id,
      reason: reason.trim(),
      quarantine_entry_date: format(new Date(), "yyyy-MM-dd"),
      inspector: user.username,
    })

    setReason("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem onClick={() => router.push(`/${selectedCompany?.slug}/almacen/ingreso/confirmar_ingreso/${id}`)} className="cursor-pointer">
                <ClipboardCheck className="size-5" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Confirmar ingreso</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <Biohazard className='size-5' />
                </DropdownMenuItem>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Enviar a cuarentena</TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center flex gap-2 justify-center items-center">Enviar a Cuarentena <Biohazard /></DialogTitle>
          <DialogDescription className="text-center">
            Indique el motivo de la retención. Compras lo usará para saber qué debe corregir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="quarantine-reason">Motivo de la cuarentena</Label>
          <Textarea
            id="quarantine-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
            placeholder="Describa el hallazgo: documento faltante, daño visible, discrepancia de datos..."
          />
          {!reasonIsValid && reason.length > 0 && (
            <p className="text-xs text-destructive">
              Mínimo {MIN_REASON_LENGTH} caracteres para justificar la cuarentena.
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 md:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} type="button">Cancelar</Button>
          {reasonIsValid && (
            <Button
              disabled={sendToQuarantine.isPending}
              variant="destructive"
              onClick={handleSendToQuarantine}
            >
              {sendToQuarantine.isPending ? <Loader2 className="size-4 animate-spin" /> : <p>Confirmar</p>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InReceptionDropdownActions
