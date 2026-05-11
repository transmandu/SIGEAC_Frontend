"use client"

import {
  useDeleteRequisition,
  useUpdateRequisitionStatus
} from "@/actions/mantenimiento/compras/requisiciones/actions"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Requisition } from "@/types"

import {
  ClipboardX,
  Loader2,
  MoreHorizontal,
  Trash2,
  FileDown,
  Receipt
} from "lucide-react"

import { useState } from "react"
import { CreateQuoteForm } from "../../../forms/mantenimiento/compras/CreateQuoteForm"
import { Button } from "../../../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../../ui/dialog"

import LoadingPage from "../../../misc/LoadingPage"
import { PDFDownloadLink } from "@react-pdf/renderer"
import RequisitionReportPdf from "@/components/pdf/almacen/RequisitionReportPdf"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
      batch_articles: batch.batch_articles.map((article: any) => ({
        part_number:
          article.article_part_number ||
          article.article_alt_part_number ||
          article.pma,
        unit: article.unit,
        quantity: parseFloat(article.quantity),
        image: article.image || null
      }))
    }))
  }
}

const iconClass =
  "size-5 transition-transform duration-200 group-hover:rotate-[6deg] group-hover:scale-110"

const itemBase =
  "group flex items-center justify-center rounded-md p-2 transition-all duration-150 hover:bg-muted/60 active:scale-95"

// helper visual disabled
const disabledClass = "opacity-40 grayscale pointer-events-none"

const RequisitionsDropdownActions = ({ req }: { req: Requisition }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)

  const { deleteRequisition } = useDeleteRequisition()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { selectedCompany } = useCompanyStore()

  const userRoles = user?.roles?.map(role => role.name) || []
  const initialData = transformApiData(req)

  if (!selectedCompany) return <LoadingPage />

  const canQuote = !(req.status === "APROBADO" || req.status === "RECHAZADO")
  const canReject = !(req.status === "RECHAZADO" || req.status === "APROBADO")

  const quoteTooltip =
    req.status === "APROBADO"
      ? "Una cotización ya fue aprobada para esta requisición, no puede cotizar"
      : req.status === "RECHAZADO"
      ? "Esta requisición ha sido rechazada, no puede cotizar"
      : "Generar cotización"

  const rejectTooltip =
    req.status === "APROBADO"
      ? "Esta requisición ya fue aprobada, no puede ser rechazada"
      : req.status === "RECHAZADO"
      ? "Esta requisición ya fue rechazada"
      : "Rechazar solicitud"

  const handleDelete = async (id: number) => {
    await deleteRequisition.mutateAsync({
      id,
      company: selectedCompany!.slug
    })
    setOpenDelete(false)
  }

  const handleReject = async (id: number, updated_by: string, status: string) => {
    await updateStatusRequisition.mutateAsync({
      id,
      data: { status, updated_by },
      company: selectedCompany!.slug
    })
    setOpenReject(false)
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-muted/60 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          className="
            flex gap-2 justify-center
            animate-in fade-in zoom-in-95
            duration-150
            rounded-lg border bg-background/95 backdrop-blur-sm
            shadow-lg
            p-2
            overflow-visible
            z-[999]
          "
        >
          {(userRoles.includes("ANALISTA_COMPRAS") ||
            userRoles.includes("SUPERUSER")) && (
            <>
              {/* COTIZACIÓN */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      disabled={!canQuote}
                      className="p-0"
                    >
                      <button
                        onClick={() => setOpenConfirm(true)}
                        className={`${itemBase} text-emerald-600 ${
                          !canQuote ? disabledClass : ""
                        }`}
                      >
                        <Receipt className={iconClass} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{quoteTooltip}</TooltipContent>
              </Tooltip>

              {/* RECHAZAR */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      disabled={!canReject}
                      onClick={() => setOpenReject(true)}
                      className="p-0"
                    >
                      <button
                        className={`${itemBase} text-orange-500 ${
                          !canReject ? disabledClass : ""
                        }`}
                      >
                        <ClipboardX className={iconClass} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{rejectTooltip}</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* PDF */}
          <PDFDownloadLink
            fileName={`${req.order_number}.pdf`}
            document={<RequisitionReportPdf requisition={req} />}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem className="p-0">
                  <button className={`${itemBase} text-blue-600`}>
                    <FileDown className={iconClass} />
                  </button>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Descargar PDF</TooltipContent>
            </Tooltip>
          </PDFDownloadLink>

          {/* DELETE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={() => setOpenDelete(true)}
                className="p-0"
              >
                <button className={`${itemBase} text-red-500`}>
                  <Trash2 className={iconClass} />
                </button>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Eliminar</TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DELETE DIALOG */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="size-6 text-red-600" />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Eliminar solicitud
            </DialogTitle>

            <DialogDescription className="text-sm">
              Esta acción eliminará la requisición{" "}
              <span className="font-medium">{req.order_number}</span>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDelete(req.id)}
              disabled={deleteRequisition.isPending}
            >
              {deleteRequisition.isPending && (
                <Loader2 className="animate-spin size-4 mr-2" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Generar Cotización
            </DialogTitle>
            <DialogDescription className="text-center">
              Complete la información requerida
            </DialogDescription>
          </DialogHeader>

          <CreateQuoteForm
            req={req}
            initialData={initialData}
            onClose={() => setOpenConfirm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* REJECT */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <ClipboardX className="size-6 text-orange-600" />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Rechazar solicitud
            </DialogTitle>

            <DialogDescription className="text-sm">
              La requisición{" "}
              <span className="font-medium">{req.order_number}</span> será rechazada.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenReject(false)}>
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
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default RequisitionsDropdownActions