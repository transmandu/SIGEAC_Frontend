"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { ClipboardX, FileDown, Receipt, Trash2 } from "lucide-react"

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
  onSuccessDelete?: () => void
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

const circleHover =
  "before:absolute before:inset-0 before:rounded-full before:scale-0 before:transition-transform before:duration-200 hover:before:scale-100"

export default function RequisitionActions({ req }: Props) {
  const { user } = useAuth()

  const [openDelete, setOpenDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)

  const userRoles = user?.roles?.map((r: any) => r.name) || []

  const canAct = !(req.status === "APROBADO" || req.status === "RECHAZADO")

  const quoteTooltip =
    req.status === "APROBADO"
      ? "Una cotización ya fue aprobada"
      : req.status === "RECHAZADO"
      ? "Requisición rechazada"
      : "Generar cotización"

  const rejectTooltip =
    req.status === "APROBADO"
      ? "Ya fue aprobada"
      : req.status === "RECHAZADO"
      ? "Ya fue rechazada"
      : "Rechazar solicitud"

  return (
    <TooltipProvider delayDuration={120}>
      <div className={toolbar}>

        {(userRoles.includes("ANALISTA_COMPRAS") ||
          userRoles.includes("JEFE_COMPRAS") ||
          userRoles.includes("SUPERUSER")) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canAct}
                onClick={() => setOpenConfirm(true)}
                className={`${itemBase} text-emerald-600`}
              >
                <Receipt className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{quoteTooltip}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canAct}
              onClick={() => setOpenReject(true)}
              className={`${itemBase} text-orange-600`}
            >
              <ClipboardX className={iconBase} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{rejectTooltip}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <PDFDownloadLink
                fileName={`${req.order_number}.pdf`}
                document={<RequisitionReportPdf requisition={req as any} />}
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

        <RequisitionDropdownDialogs
          req={req as any}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
        />
      </div>
    </TooltipProvider>
  )
}