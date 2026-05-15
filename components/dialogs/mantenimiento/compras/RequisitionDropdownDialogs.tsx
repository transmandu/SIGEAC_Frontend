"use client"

import {
  useDeleteRequisition,
  useUpdateRequisitionStatus
} from "@/actions/mantenimiento/compras/requisiciones/actions"

import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Requisition } from "@/types"

import {
    AlertTriangle,
  ClipboardX,
  Loader2,
  Receipt,
  Trash2
} from "lucide-react"

import LoadingPage from "@/components/misc/LoadingPage"

import { CreateQuoteForm } from "../../../forms/mantenimiento/compras/CreateQuoteForm"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useState } from "react"

function transformApiData(apiData: any) {
  return {
    order_number: apiData.order_number,
    justification: apiData.justification,
    company: "",
    created_by: apiData.created_by.id.toString(),
    tax: "0",
    requested_by: apiData.requested_by,

    articles: apiData.batch.map((batch: any) => ({
      batch: batch.id.toString(),
      batch_name: batch.name,

      batch_articles: batch.batch_articles.map(
        (article: any) => ({
          part_number:
            article.article_part_number ||
            article.article_alt_part_number ||
            article.pma,

          unit: article.unit,
          quantity: parseFloat(article.quantity),
          image: article.image || null
        })
      )
    }))
  }
}

type Props = {
  req: Requisition

  openDelete: boolean
  setOpenDelete: (open: boolean) => void

  openConfirm: boolean
  setOpenConfirm: (open: boolean) => void

  openReject: boolean
  setOpenReject: (open: boolean) => void
}

const dialogClass = `
  sm:max-w-[390px]
  rounded-3xl
  border border-border/50
  bg-background/95
  backdrop-blur-xl
  shadow-2xl
  overflow-hidden
  p-0
`

const RequisitionDropdownDialogs = ({
  req,

  openDelete,
  setOpenDelete,

  openConfirm,
  setOpenConfirm,

  openReject,
  setOpenReject
}: Props) => {
  const { user } = useAuth()

  const { selectedCompany } = useCompanyStore()

  const { deleteRequisition } =
    useDeleteRequisition()

  const { updateStatusRequisition } =
    useUpdateRequisitionStatus()

  const [Observation, setObservation] = useState("")

  const initialData = transformApiData(req)

  if (!selectedCompany) return <LoadingPage />

  const handleDelete = async (id: number) => {
    await deleteRequisition.mutateAsync({
      id,
      company: selectedCompany.slug
    })

    setOpenDelete(false)
  }

  const handleReject = async (
    id: number,
    updated_by: string,
    status: string
  ) => {
    await updateStatusRequisition.mutateAsync({
      id,
      data: {
        status,
        updated_by,
        observation: Observation.trim() || null
      },
      company: selectedCompany.slug
    })

    setObservation("")
    setOpenReject(false)
  }

  return (
    <>
      {/* DELETE */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className={dialogClass}>
            
            <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
            
            <div
                className="
                flex items-center justify-center
                size-12 rounded-2xl
                border border-red-500/15
                bg-red-500/[0.08]
                "
            >
                <Trash2 className="size-5 text-red-600" />
            </div>

            <DialogTitle className="text-[16px] font-semibold tracking-tight">
                Eliminar solicitud
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
                Vas a eliminar la solicitud{" "}
                <span className="font-medium text-foreground">
                {req.order_number}
                </span>
            </DialogDescription>
            </DialogHeader>

            {/* WARNING BOX */}
            <div className="mx-6 mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-sm text-red-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
                Esta acción es <b>irreversible</b> y eliminará permanentemente el registro del sistema.
            </div>
            </div>

            {/* ACTIONS */}
            <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
            
            <Button
                variant="outline"
                onClick={() => setOpenDelete(false)}
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
                onClick={() => handleDelete(req.id)}
                disabled={deleteRequisition.isPending}
                className="
                rounded-xl
                bg-red-600/90
                hover:bg-red-600
                "
            >
                {deleteRequisition.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Eliminar
            </Button>

            </div>
        </DialogContent>
        </Dialog>

      {/* REJECT */}
        <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className={dialogClass}>
            
            <DialogHeader className="px-6 pt-8 pb-3 flex flex-col items-center text-center space-y-3">
            
            <div
                className="
                flex items-center justify-center
                size-12 rounded-2xl
                border border-orange-500/15
                bg-orange-500/[0.08]
                "
            >
                <ClipboardX className="size-5 text-orange-600" />
            </div>

            <DialogTitle className="text-[16px] font-semibold tracking-tight">
                Rechazar solicitud
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed max-w-sm">
                La solicitud{" "}
                <span className="font-medium text-foreground">
                {req.order_number}
                </span>{" "}
                será rechazada y cambiará su estado.
            </DialogDescription>
            </DialogHeader>

            {/* WARNING BOX */}
            <div className="mx-6 mt-4 p-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] text-sm text-orange-600 flex gap-2 leading-relaxed">
            <AlertTriangle className="size-4 mt-[2px]" />
            <div>
                Esta acción es <b>irreversible</b>. La requisición será marcada como rechazada permanentemente.
            </div>
            </div>
            <div className="mx-6 mt-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Observación de rechazo (opcional)
              </label>

              <textarea
                value={Observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ej: documentación incompleta, proveedor no cumple requisitos..."
                className="
                  w-full min-h-[90px] resize-none
                  rounded-xl border border-border/60
                  bg-background/70
                  px-3 py-2 text-sm
                  text-foreground
                  outline-none
                  focus:border-orange-400/50
                  focus:ring-2 focus:ring-orange-500/10
                  transition
                "
              />
            </div>

            {/* ACTIONS */}
            <div className="px-6 pb-6 pt-5 flex justify-end gap-2">
            
            <Button
                variant="outline"
                onClick={() => setOpenReject(false)}
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
                onClick={() =>
                handleReject(
                    req.id,
                    `${user?.first_name} ${user?.last_name}`,
                    "RECHAZADO"
                )
                }
                disabled={updateStatusRequisition.isPending}
                className="
                rounded-xl
                bg-orange-500/90
                hover:bg-orange-500
                "
            >
                {updateStatusRequisition.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Rechazar
            </Button>

            </div>
        </DialogContent>
        </Dialog>

      {/* CREATE QUOTE */}
      <Dialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
      >
        <DialogContent
          className="
            max-w-5xl
            overflow-hidden
            rounded-3xl
            border border-border/50
            bg-background/95
            backdrop-blur-xl
            shadow-2xl
            p-0
          "
        >
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
                <Receipt className="size-6 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <DialogTitle
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                  "
                >
                  Generar cotización
                </DialogTitle>

                <DialogDescription
                  className="
                    max-w-2xl
                    text-sm
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  Complete la información
                  requerida para generar una
                  nueva cotización asociada a la
                  requisición{" "}
                  <span className="font-medium text-foreground">
                    {req.order_number}
                  </span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6">
            <CreateQuoteForm
              req={req}
              initialData={initialData}
              onClose={() =>
                setOpenConfirm(false)
              }
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RequisitionDropdownDialogs