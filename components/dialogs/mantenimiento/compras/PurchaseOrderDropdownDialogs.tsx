"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  AlertOctagon,
  AlertTriangle,
  ClipboardCheck,
  Loader2,
  Wallet,
} from "lucide-react"
import type { PurchaseOrder } from "@/types/purchase"
import { isAeronauticalPurchaseOrder } from "@/lib/purchases/purchase-order-scope"
import { useCascadeDeletePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions"
import { useCompanyStore } from "@/stores/CompanyStore"
import { PayPurchaseOrderForm } from "../../../forms/mantenimiento/compras/PayPurchaseOrderForm"
import { CompleteOrderForm } from "../../../forms/mantenimiento/compras/CompleteOrderForm"

type Props = {
  po: PurchaseOrder

  openApprove: boolean
  setOpenApprove: (open: boolean) => void

  openCascadeDelete?: boolean
  setOpenCascadeDelete?: (open: boolean) => void
  onSuccessCascadeDelete?: () => void
}

const dialogClass =
  "w-[95vw] max-w-[95vw] sm:max-w-5xl max-h-[85vh] flex flex-col rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const deleteDialogClass =
  "sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"

const PurchaseOrderDropdownDialogs = ({
  po,
  openApprove,
  setOpenApprove,
  openCascadeDelete,
  setOpenCascadeDelete,
  onSuccessCascadeDelete
}: Props) => {
  const { selectedCompany } = useCompanyStore()
  const { cascadeDeletePurchaseOrder } = useCascadeDeletePurchaseOrder()

  const isPaying = po.status === "PENDING"
  const isCompleting = po.status === "PAID"
  const isAeronautical = isAeronauticalPurchaseOrder(po)
  const hasRealInventoryImpact = po.status === "PAID" || po.status === "COMPLETED"

  const handleCascadeDelete = async () => {
    if (!selectedCompany) return

    await cascadeDeletePurchaseOrder.mutateAsync({
      id: po.id,
      company: selectedCompany.slug
    })

    setOpenCascadeDelete?.(false)

    onSuccessCascadeDelete?.()
  }

  return (
    <>
      {/* =========================
          CASCADE DELETE (SUPERUSER)
      ========================= */}

      {openCascadeDelete !== undefined && setOpenCascadeDelete && (
        <Dialog open={openCascadeDelete} onOpenChange={setOpenCascadeDelete}>
          <DialogContent className={deleteDialogClass}>
            <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
              <div
                className="
                  flex items-center justify-center
                  size-12 rounded-2xl
                  border border-red-500/15
                  bg-red-500/[0.08]
                "
              >
                <AlertOctagon className="size-5 text-red-600" />
              </div>

              <DialogTitle className="text-[16px] font-semibold tracking-tight">
                Eliminar orden de compra en cascada
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
                La orden de compra{" "}
                <span className="font-medium text-foreground">
                  {po.order_number}
                </span>{" "}
                será eliminada permanentemente.
              </DialogDescription>
            </DialogHeader>

            <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2 leading-relaxed">
              <AlertTriangle className="size-4 mt-[2px]" />
              <div>
                Esta acción es <b>irreversible</b>.{" "}
                {hasRealInventoryImpact
                  ? "Esta orden ya fue pagada: se eliminarán los artículos generados y se revertirá el stock correspondiente."
                  : "Se eliminarán sus artículos asociados."}
              </div>
            </div>

            <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenCascadeDelete(false)}
                className="
                  rounded-xl
                  border border-border/60
                  bg-background
                  hover:bg-muted
                  text-muted-foreground
                  hover:text-foreground
                "
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={handleCascadeDelete}
                disabled={cascadeDeletePurchaseOrder.isPending}
                className="
                  rounded-xl
                  bg-red-600/90
                  hover:bg-red-600
                "
              >
                {cascadeDeletePurchaseOrder.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Eliminar en cascada
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
