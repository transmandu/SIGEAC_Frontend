"use client"

import {
  useDeleteQuote,
  useUpdateQuoteStatus
} from "@/actions/mantenimiento/compras/cotizaciones/actions"
import {
  useUpdateRequisitionStatus
} from "@/actions/mantenimiento/compras/requisiciones/actions"
import {
  useCreatePurchaseOrder
} from "@/actions/mantenimiento/compras/ordenes_compras/actions"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Quote } from "@/types"
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardX,
  Loader2,
  Receipt,
  Trash2
} from "lucide-react"
import LoadingPage from "@/components/misc/LoadingPage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

/* =========================
   STYLES
========================= */

const dialogClass =
  "sm:max-w-[390px] rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0"
const header =
  "px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3"
const iconBase = (color: "red" | "orange" | "green") => `
  flex items-center justify-center
  size-12 rounded-2xl
  border
  ${
    color === "red"
      ? "border-red-500/15 bg-red-500/[0.08] text-red-600"
      : color === "orange"
      ? "border-orange-500/15 bg-orange-500/[0.08] text-orange-600"
      : "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600"
  }
`

const title =
  "text-[16px] font-semibold tracking-tight"
const description =
  "text-sm text-muted-foreground text-center leading-relaxed max-w-sm"
const warningBox = (color: "red" | "orange") => `
  mx-6 mt-4 p-3 rounded-xl border text-sm leading-relaxed flex gap-2
  ${
    color === "red"
      ? "border-red-500/20 bg-red-500/[0.05] text-red-600"
      : "border-orange-500/20 bg-orange-500/[0.05] text-orange-600"
  }
`

const footer =
  "px-6 pb-6 pt-5 flex justify-end gap-2"
const cancelBtn =
  "rounded-xl border border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition"
const dangerBtn =
  "rounded-xl bg-red-600 hover:bg-red-700 text-white"
const warningBtn =
  "rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
const successBtn =
  "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"

type Props = {
  quote: Quote
  openReject: boolean
  setOpenReject: (open: boolean) => void
  openApprove: boolean
  setOpenApprove: (open: boolean) => void
  openDelete: boolean
  setOpenDelete: (open: boolean) => void
}

const QuoteDropdownDialogs = ({
  quote,
  openReject,
  setOpenReject,
  openApprove,
  setOpenApprove,
  openDelete,
  setOpenDelete
}: Props) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const { updateStatusQuote } = useUpdateQuoteStatus()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { createPurchaseOrder } = useCreatePurchaseOrder()
  const { deleteQuote } = useDeleteQuote()

  const [Observation, setObservation] = useState("")

  if (!selectedCompany) return <LoadingPage />

  const handleReject = async () => {
    await updateStatusQuote.mutateAsync({
      id: quote.id,
      data: {
        status: "RECHAZADA",
        updated_by: `${user?.first_name} ${user?.last_name}`,
        observation: Observation.trim() || null
      },
      company: selectedCompany.slug
    })

    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: {
        status: "PROCESO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany.slug
    })

    setObservation("")
    setOpenReject(false)
  }

  const handleApprove = async () => {
    const poData = {
      status: "PROCESO",
      justification: quote.justification,
      purchase_date: new Date(),
      sub_total: Number(quote.total),
      total: Number(quote.total),
      vendor_id: Number(quote.vendor.id),
      created_by: `${user?.first_name} ${user?.last_name}`,
      articles_purchase_orders: quote.article_quote_order,
      quote_order_id: Number(quote.id)
    }

    await updateStatusQuote.mutateAsync({
      id: quote.id,
      data: {
        status: "APROBADO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany.slug
    })

    await createPurchaseOrder.mutateAsync({
      data: poData,
      company: selectedCompany.slug
    })

    await updateStatusRequisition.mutateAsync({
      id: quote.requisition_order.id,
      data: {
        status: "APROBADO",
        updated_by: `${user?.first_name} ${user?.last_name}`
      },
      company: selectedCompany.slug
    })

    setOpenApprove(false)
  }
  const handleDelete = async () => {
    await deleteQuote.mutateAsync({
      id: quote.id,
      company: selectedCompany.slug
    })

    setOpenDelete(false)
  }

  return (
    <>
    {/* =========================
        DELETE
    ========================= */}

    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={header}>
          <div className={iconBase("red")}>
            <Trash2 className="size-5" />
          </div>

          <DialogTitle className={title}>
            Eliminar cotización
          </DialogTitle>

          <DialogDescription className={description}>
            La cotización{" "}
            <span className="font-medium text-foreground">
              {quote.quote_number}
            </span>{" "}
            será eliminada permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className={warningBox("red")}>
          <AlertTriangle className="size-4 mt-[2px]" />

          <div>
            Esta acción es <b>irreversible</b> y eliminará el registro del sistema.
          </div>
        </div>

        <div className={footer}>
          <Button
            variant="outline"
            onClick={() => setOpenDelete(false)}
            className={cancelBtn}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleDelete}
            disabled={deleteQuote.isPending}
            className={dangerBtn}
          >
            {deleteQuote.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}

            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
      {/* =========================
          REJECT
      ========================= */}

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className={dialogClass}>
          <DialogHeader className={header}>
            <div className={iconBase("orange")}>
              <ClipboardX className="size-5" />
            </div>
            <DialogTitle className={title}>
              Rechazar cotización
            </DialogTitle>
            <DialogDescription className={description}>
              La cotización{" "}
              <span className="font-medium text-foreground">
                {quote.quote_number}
              </span>{" "}
              será rechazada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className={warningBox("orange")}>
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
              Esta acción es <b>irreversible</b> y afectará el estado de la solicitud asociada.
            </div>
          </div>
          <div className="mx-6 mt-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Observación de rechazo (opcional)
            </label>

            <textarea
              value={Observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ej: precio no competitivo, proveedor no cumple requisitos..."
              className="
                w-full min-h-[90px] resize-none
                rounded-xl border border-border/60
                bg-background/70
                px-3 py-2 text-sm
                text-foreground
                outline-none
                focus:border-red-400/50
                focus:ring-2 focus:ring-red-500/10
                transition
              "
            />
          </div>
          <div className={footer}>
            <Button
              variant="outline"
              onClick={() => setOpenReject(false)}
              className={cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={updateStatusQuote.isPending}
              className={warningBtn}
            >
              {updateStatusQuote.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Rechazar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================
          APPROVE
      ========================= */}

      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent className={dialogClass}>
          <DialogHeader className={header}>
            <div className={iconBase("green")}>
              <ClipboardCheck className="size-5" />
            </div>
            <DialogTitle className={title}>
              Aprobar cotización
            </DialogTitle>
            <DialogDescription className={description}>
              Se generará automáticamente una orden de compra a partir de la cotización{" "}
              <span className="font-medium text-foreground">
                {quote.quote_number}
              </span>.
            </DialogDescription>
          </DialogHeader>
          <div className="mx-6 mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] text-sm text-emerald-600 flex gap-2 leading-relaxed">
            <Receipt className="size-4 mt-[2px]" />
            <div>
              Esta acción creará una orden de compra y actualizará el flujo de la solicitud.
            </div>
          </div>
          <div className={footer}>
            <Button
              variant="outline"
              onClick={() => setOpenApprove(false)}
              className={cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateStatusQuote.isPending}
              className={successBtn}
            >
              {updateStatusQuote.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Aprobar
            </Button>

          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QuoteDropdownDialogs