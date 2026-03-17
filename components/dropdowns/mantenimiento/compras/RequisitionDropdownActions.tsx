"use client"

import { useDeleteRequisition, useUpdateRequisitionStatus } from "@/actions/mantenimiento/compras/requisiciones/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useCompanyStore } from "@/stores/CompanyStore"
import { Requisition } from "@/types"
import { ClipboardCheck, ClipboardX, Loader2, MoreHorizontal, Trash2, FileDown, Receipt } from "lucide-react"
import { useState } from "react"
import { CreateQuoteForm } from "../../../forms/mantenimiento/compras/CreateQuoteForm"
import { Button } from "../../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog"
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
        part_number: article.article_part_number || article.article_alt_part_number || article.pma,
        unit: article.unit,
        quantity: parseFloat(article.quantity),
        image: article.image || null,
      })),
    })),
  };
}

const RequisitionsDropdownActions = ({ req }: { req: Requisition }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState<boolean>(false)
  const [openDelete, setOpenDelete] = useState<boolean>(false)
  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [openReject, setOpenReject] = useState<boolean>(false)
  const { deleteRequisition } = useDeleteRequisition()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()
  const { selectedCompany } = useCompanyStore()
  const userRoles = user?.roles?.map(role => role.name) || []
  const initialData = transformApiData(req)

  if (!selectedCompany) return <LoadingPage />

  const handleDelete = async (id: number, company: string) => {
    await deleteRequisition.mutateAsync({ id, company: selectedCompany!.slug })
    setOpenDelete(false)
  }

  const handleReject = async (id: number, updated_by: string, status: string, company: string) => {
    const data = { status, updated_by }
    await updateStatusRequisition.mutateAsync({ id, data, company: selectedCompany!.slug })
    setOpenReject(false)
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {(userRoles.includes("ANALISTA_COMPRAS") || userRoles.includes("SUPERUSER")) && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuItem
                      asChild
                      disabled={req.status === 'APROBADO' || req.status === 'RECHAZADO'}
                      className="cursor-pointer"
                      onClick={() => setOpenConfirm(true)}
                    >
                      <button>
                        <Receipt className='size-5' />
                      </button>
                    </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  {req.status === "RECHAZADO"
                    ? "No se puede generar una cotización para una requisición rechazada."
                    : req.status === "APROBADO"
                    ? "Esta requisición ya fue aprobada, no se puede generar una nueva cotización."
                    : "Generar cotización"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      disabled={req.status === 'RECHAZADO' || req.status === 'APROBADO'}
                      onClick={() => setOpenReject(true)}
                      className="cursor-pointer"
                    >
                      <ClipboardX className="size-5" />
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {req.status === "APROBADO"
                    ? "Una cotización de esta requisición ya fue aceptada, no se puede rechazar."
                    : req.status === "RECHAZADO"
                    ? "Esta requisición ya fue rechazada."
                    : "Rechazar solicitud"}
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <PDFDownloadLink fileName={`${req.order_number}.pdf`} document={<RequisitionReportPdf requisition={req} />}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem className="cursor-pointer">
                  <FileDown className="size-5 text-blue-600 hover:text-blue-700" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>Descargar PDF</TooltipContent>
            </Tooltip>
          </PDFDownloadLink>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem onClick={() => setOpenDelete(true)} className="cursor-pointer">
                <Trash2 className="size-5 text-red-500" />
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>Eliminar solicitud</TooltipContent>
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="size-6 text-red-600" />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Eliminar solicitud
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-sm max-w-sm">
              Esta acción eliminará permanentemente la solicitud
              <span className="font-medium"> {req.order_number}</span>. Esta operación no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDelete(req.id, selectedCompany!.slug)}
              disabled={deleteRequisition.isPending}
              className="flex items-center gap-2"
            >
              {deleteRequisition.isPending && (
                <Loader2 className="animate-spin size-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Generar Cotización</DialogTitle>
            <DialogDescription className="text-center">
              Ingrese la información necesaria para generar la cotización.
            </DialogDescription>
          </DialogHeader>
          <CreateQuoteForm req={req} initialData={initialData} onClose={() => setOpenConfirm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <ClipboardX className="size-6 text-orange-600" />
            </div>

            <DialogTitle className="text-xl font-semibold">
              Rechazar solicitud
            </DialogTitle>

            <DialogDescription className="text-muted-foreground text-sm max-w-sm">
              La solicitud <span className="font-medium">{req.order_number}</span> será marcada como rechazada.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpenReject(false)}>
              Cancelar
            </Button>

            <Button
              onClick={() => handleReject(req.id, `${user?.first_name} ${user?.last_name}`, "RECHAZADO", selectedCompany!.slug)}
              disabled={updateStatusRequisition.isPending || req.status === 'APROBADA'}
              className="flex items-center gap-2"
            >
              {updateStatusRequisition.isPending && (
                <Loader2 className="animate-spin size-4" />
              )}
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default RequisitionsDropdownActions