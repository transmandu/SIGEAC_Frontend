"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  ClipboardX,
  FileDown,
  Receipt,
  Trash2
} from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import RequisitionReportPdf from "@/components/pdf/almacen/RequisitionReportPdf"
import RequisitionDropdownDialogs from "@/components/dialogs/mantenimiento/compras/RequisitionDropdownDialogs"

export interface RequisitionByOrderNumber {
  id: number
  order_number: string
  status: string
  type: "GENERAL" | "AERONAUTICO"
  created_by: any
  requested_by: string
  received_by: string
  image?: string
  justification: string
  arrival_date?: Date
  submission_date?: Date
  submitted_date?: Date
  aircraft?: any
  observation?: string

  batch: {
    id: number
    name: string
    batch_articles: {
      article_part_number: string
      article_alt_part_number?: string
      quantity: number
      unit?: any
      image?: string
    }[]
  }[]
}

type Props = {
  req: RequisitionByOrderNumber
  onSuccessUpdate?: () => Promise<any>
}

const iconBase =
  "size-[20px] transition-all duration-200 ease-out group-hover:scale-110"

const itemBase =
  "group relative flex items-center justify-center size-11 rounded-full transition-all duration-200 " +
  "hover:bg-muted/60 hover:shadow-sm active:scale-95 " +
  "border border-transparent hover:border-border/40"

const toolbar =
  "flex items-center gap-1.5 px-2 py-1 rounded-full " +
  "bg-muted/30 border border-border/40 shadow-sm backdrop-blur-md " +
  "flex-wrap sm:flex-nowrap"

export default function RequisitionActions({
  req,
  onSuccessUpdate
}: Props) {
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()

  const [openDelete, setOpenDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)

  const status = req.status

  const isApproved = status === "APROBADO"
  const isRejected = status === "RECHAZADO"
  const isFinal = isApproved || isRejected

  const canAct = !isFinal
  const canDelete = !isFinal

  const quoteTooltip =
    isApproved
      ? "Requisición ya aprobada"
      : isRejected
      ? "Requisición rechazada"
      : "Generar cotización"

  const rejectTooltip =
    isApproved
      ? "Ya fue aprobada"
      : isRejected
      ? "Ya fue rechazada"
      : "Rechazar solicitud"

  const handleSuccessUpdate = async () => {
    await onSuccessUpdate?.()
  }

  const handleSuccessDelete = () => {
    router.push(`/${selectedCompany!.slug}/compras/requisiciones`)
    router.refresh()
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div className={toolbar}>

        {/* APROBAR / GENERAR */}
        {canAct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenConfirm(true)}
                className={`${itemBase} text-emerald-600`}
              >
                <Receipt className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{quoteTooltip}</TooltipContent>
          </Tooltip>
        )}

        {/* RECHAZAR */}
        {canAct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenReject(true)}
                className={`${itemBase} text-orange-600`}
              >
                <ClipboardX className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{rejectTooltip}</TooltipContent>
          </Tooltip>
        )}

        {/* PDF (siempre visible) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <PDFDownloadLink
                fileName={`${req.order_number}.pdf`}
                document={
                  <RequisitionReportPdf requisition={req as any} />
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${itemBase} text-blue-600`}
                >
                  <FileDown className={iconBase} />
                </Button>
              </PDFDownloadLink>
            </div>
          </TooltipTrigger>
          <TooltipContent>Descargar PDF</TooltipContent>
        </Tooltip>

        {/* DELETE */}
        {canDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenDelete(true)}
                className={`${itemBase} text-red-600`}
              >
                <Trash2 className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar solicitud</TooltipContent>
          </Tooltip>
        )}

        <RequisitionDropdownDialogs
          req={req as any}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
          onSuccessUpdate={handleSuccessUpdate}
          onSuccessDelete={handleSuccessDelete}
        />
      </div>
    </TooltipProvider>
  )
}