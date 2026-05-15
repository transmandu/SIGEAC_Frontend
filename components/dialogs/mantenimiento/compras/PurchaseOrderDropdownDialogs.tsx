"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  ClipboardCheck,
} from "lucide-react"
import { PurchaseOrder } from "@/types"
import { CompletePurchaseForm } from "../../../forms/mantenimiento/compras/CompletePurchaseForm"

type Props = {
  po: PurchaseOrder

  openApprove: boolean
  setOpenApprove: (open: boolean) => void
}

const dialogClass =
  "sm:max-w-5xl rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const PurchaseOrderDropdownDialogs = ({
  po,
  openApprove,
  setOpenApprove
}: Props) => {
  return (
    <>
      {/* =========================
          COMPLETE PURCHASE
      ========================= */}

      <Dialog
        open={openApprove}
        onOpenChange={setOpenApprove}
      >
        <DialogContent className={dialogClass}>

          <DialogHeader
            className="
              border-b border-border/40
              bg-muted/20
              px-8
              pt-8
              pb-6
              text-left
            "
          >
            <div className="flex items-start gap-4">

              <div
                className="
                  flex items-center justify-center
                  size-14 shrink-0
                  rounded-2xl
                  border border-emerald-500/10
                  bg-emerald-500/[0.08]
                "
              >
                <ClipboardCheck className="size-6 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <DialogTitle
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                  "
                >
                  Completar compra
                </DialogTitle>

                <DialogDescription
                  className="
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  Complete la información requerida
                  para confirmar y finalizar la orden
                  de compra{" "}
                  <span className="font-medium text-foreground">
                    {po.order_number}
                  </span>.
                </DialogDescription>
              </div>

            </div>
          </DialogHeader>

          <div className="px-8 py-6">
            <CompletePurchaseForm
              po={po}
              onClose={() =>
                setOpenApprove(false)
              }
            />
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}

export default PurchaseOrderDropdownDialogs