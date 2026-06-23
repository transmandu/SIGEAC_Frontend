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
  Wallet,
} from "lucide-react"
import type { PurchaseOrder } from "@/types/purchase"
import { isAeronauticalPurchaseOrder } from "@/lib/purchases/purchase-order-scope"
import { PayPurchaseOrderForm } from "../../../forms/mantenimiento/compras/PayPurchaseOrderForm"
import { CompleteOrderForm } from "../../../forms/mantenimiento/compras/CompleteOrderForm"

type Props = {
  po: PurchaseOrder

  openApprove: boolean
  setOpenApprove: (open: boolean) => void
}

const dialogClass =
  "w-[95vw] max-w-[95vw] sm:max-w-5xl max-h-[85vh] flex flex-col rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const PurchaseOrderDropdownDialogs = ({
  po,
  openApprove,
  setOpenApprove
}: Props) => {
  const isPaying = po.status === "PENDIENTE"
  const isCompleting = po.status === "PAGADA"
  const isAeronautical = isAeronauticalPurchaseOrder(po)

  return (
    <>
      {/* =========================
          PAY ORDER
      ========================= */}

      {isPaying && (
        <Dialog
          open={openApprove}
          onOpenChange={setOpenApprove}
        >
          <DialogContent className={dialogClass}>

            <DialogHeader
              className="
                shrink-0
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
                  <Wallet className="size-6 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <DialogTitle
                    className="
                      text-2xl
                      font-semibold
                      tracking-tight
                    "
                  >
                    Pagar orden de compra
                  </DialogTitle>

                  <DialogDescription
                    className="
                      max-w-2xl
                      text-sm
                      leading-relaxed
                      text-muted-foreground
                    "
                  >
                    Ingrese los datos de pago, costos e impuestos
                    para la orden de compra{" "}
                    <span className="font-medium text-foreground">
                      {po.order_number}
                    </span>.
                  </DialogDescription>
                </div>

              </div>
            </DialogHeader>

            <div className="overflow-y-auto px-8 py-6">
              <PayPurchaseOrderForm
                po={po}
                isAeronautical={isAeronautical}
                onClose={() =>
                  setOpenApprove(false)
                }
              />
            </div>

          </DialogContent>
        </Dialog>
      )}

      {/* =========================
          COMPLETE ORDER
      ========================= */}

      {isCompleting && (
        <Dialog
          open={openApprove}
          onOpenChange={setOpenApprove}
        >
          <DialogContent className={dialogClass}>

            <DialogHeader
              className="
                shrink-0
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
                    Completar orden de compra
                  </DialogTitle>

                  <DialogDescription
                    className="
                      max-w-2xl
                      text-sm
                      leading-relaxed
                      text-muted-foreground
                    "
                  >
                    Revise y confirme la información de la orden
                    de compra{" "}
                    <span className="font-medium text-foreground">
                      {po.order_number}
                    </span>.
                  </DialogDescription>
                </div>

              </div>
            </DialogHeader>

            <div className="overflow-y-auto px-8 py-6">
              <CompleteOrderForm
                po={po}
                isAeronautical={isAeronautical}
                onClose={() =>
                  setOpenApprove(false)
                }
              />
            </div>

          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default PurchaseOrderDropdownDialogs
