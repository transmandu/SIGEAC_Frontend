import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { PurchaseOrder } from "@/types"
import { ClipboardCheck, EyeIcon, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { CompletePurchaseForm } from "../../../forms/mantenimiento/compras/CompletePurchaseForm"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog"

const PurchaseOrderDropdownActions = ({ po }: { po: PurchaseOrder }) => {
  const [openApprove, setOpenApprove] = useState<boolean>(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {
            po.status !== 'pagado' && (
              <>
                <DropdownMenuItem onClick={() => setOpenApprove(true)}>
                  <ClipboardCheck className='size-5 text-green-500' />
                </DropdownMenuItem>
              </>
            )
          }
          <DropdownMenuItem >
            <EyeIcon className="size-5" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>


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
    </>
  )
}

export default PurchaseOrderDropdownActions
