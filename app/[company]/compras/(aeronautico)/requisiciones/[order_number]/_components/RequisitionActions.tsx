"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  AlertOctagon,
  ClipboardX,
  FileDown,
  Receipt,
  Trash2
} from "lucide-react"
import DownloadRequisitionPdfDialog from "@/components/dialogs/mantenimiento/compras/DownloadRequisitionPdfDialog"
import RequisitionDropdownDialogs from "@/components/dialogs/mantenimiento/compras/RequisitionDropdownDialogs"
import QuoteLinkButton from "@/components/dropdowns/mantenimiento/compras/QuoteLinkButton"
import { RequisitionByOrderNumber } from "@/hooks/mantenimiento/compras/useGetRequisitionByOrderNumber"

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
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const [openDelete, setOpenDelete] = useState(false)
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openPdf, setOpenPdf] = useState(false)

  const status = req.status

  const isApproved = status === "APPROVED"
  const isRejected = status === "REJECTED"
  const isFinal = isApproved || isRejected

  const canAct = !isFinal
  const canDelete = !isFinal
  const isSuperUser = (user?.roles?.map((role) => role.name) || []).includes("SUPERUSER")

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

        {/* QUOTE LINK */}
        {selectedCompany?.slug && (req.quotes?.length ?? 0) > 0 && (
          <QuoteLinkButton
            company={selectedCompany.slug}
            quotes={req.quotes ?? []}
            segment="cotizaciones"
            className={itemBase}
            iconClassName={iconBase}
          />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenPdf(true)}
              className={`${itemBase} text-blue-600`}
            >
              <FileDown className={iconBase} />
            </Button>
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

        {/* CASCADE DELETE (SUPERUSER) */}
        {isSuperUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenCascadeDelete(true)}
                className={`${itemBase} text-red-700`}
              >
                <AlertOctagon className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar en cascada (SuperUser)</TooltipContent>
          </Tooltip>
        )}

        <RequisitionDropdownDialogs
          req={req as any}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
          onSuccessUpdate={handleSuccessUpdate}
          onSuccessDelete={handleSuccessDelete}
        />

        <DownloadRequisitionPdfDialog
          req={req}
          open={openPdf}
          onOpenChange={setOpenPdf}
        />
      </div>
    </TooltipProvider>
  )
}