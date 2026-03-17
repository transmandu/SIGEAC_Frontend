"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { PurchaseOrder } from "@/types"
import { ClipboardCheck, MoreHorizontal, Minus } from "lucide-react"
import { useState } from "react"
import { CompletePurchaseForm } from "../../../forms/mantenimiento/compras/CompletePurchaseForm"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const PurchaseOrderDropdownActions = ({ po }: { po: PurchaseOrder }) => {
  const [openApprove, setOpenApprove] = useState<boolean>(false)

  const isInactive = po.status?.toUpperCase() === "PAGADO"

  return (
    <TooltipProvider>
      {isInactive ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-not-allowed">
              <span className="sr-only">Sin acciones</span>
              <Minus className="h-4 w-4 text-gray-300" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>No hay acciones disponibles para una orden de compra pagada.</TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="flex gap-2 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={() => setOpenApprove(true)}>
                  <ClipboardCheck className="size-5 text-green-500" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Completar compra</TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className="max-w-lg lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">Completar Compra</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Ingrese los datos de la compra para confirmar la orden.
            </DialogDescription>

            <CompletePurchaseForm po={po} onClose={() => setOpenApprove(false)} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default PurchaseOrderDropdownActions