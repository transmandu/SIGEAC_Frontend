"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type { Requisition } from "@/types/purchase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  ClipboardX,
  FileDown,
  MoreHorizontal,
  Receipt,
  Tag,
  Trash2
} from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import RequisitionReportPdf from "@/components/pdf/almacen/RequisitionReportPdf"
import RequisitionDropdownDialogs from "@/components/dialogs/mantenimiento/compras/RequisitionDropdownDialogs"
import UpdateRequisitionPriorityDialog from "@/components/dialogs/mantenimiento/compras/UpdateRequisitionPriorityDialog"

const iconBase =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110"
const iconReject =
  "size-[18px] transition-all duration-200 ease-out group-hover:scale-110"
const itemBase = `
  group
  relative
  flex
  items-center
  justify-center
  size-9
  rounded-xl
  transition-all
  duration-200
  ease-out
  hover:bg-muted
  hover:shadow-sm
  active:scale-95
`
const disabledClass =
  "opacity-40 grayscale pointer-events-none cursor-not-allowed"

const RequisitionDropdownActions = ({
  req
}: {
  req: Requisition
}) => {
  const { user } = useAuth()

  const [openDropdown, setOpenDropdown] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openPriority, setOpenPriority] = useState(false)

  const userRoles = user?.roles?.map(role => role.name) || []
  const canChangePriority = ["JEFE_ALMACEN", "SUPERUSER"].some(role =>
    userRoles.includes(role)
  );
  const canSeeAllOptions = ["JEFE_COMPRAS", "ANALISTA_COMPRAS","ASISTENTE_COMPRAS", "SUPERUSER"].some(role =>
    userRoles.includes(role)
  );

  const canQuote =
    !(req.status === "APROBADA" || req.status === "RECHAZADO")
  const canReject =
    !(req.status === "RECHAZADO" || req.status === "APROBADA")
  const canChangePriorityStatus =
    !(req.status === "APROBADA" || req.status === "COTIZADO")

  const quoteTooltip =
    req.status === "APROBADA"
      ? "Una cotización ya fue aprobada para esta requisición"
      : req.status === "RECHAZADO"
      ? "Esta requisición ha sido rechazada"
      : "Generar cotización"
  const rejectTooltip =
    req.status === "APROBADA"
      ? "Esta requisición ya fue aprobada"
      : req.status === "RECHAZADO"
      ? "Esta requisición ya fue rechazada"
      : "Rechazar solicitud"
  const priorityTooltip =
    req.status === "APROBADA"
      ? "Esta requisición ya fue aprobada"
      : req.status === "COTIZADO"
      ? "Esta requisición ya fue cotizada"
      : "Cambiar prioridad"

  return (
    <TooltipProvider delayDuration={120}>
      <>
        <DropdownMenu
          open={openDropdown}
          onOpenChange={setOpenDropdown}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                size-8
                rounded-xl
                border border-transparent
                transition-all duration-200
                hover:bg-muted/70
                hover:border-border/50
                hover:shadow-sm
                data-[state=open]:bg-muted
              "
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            sideOffset={3}
            className="
              flex items-center justify-center gap-1.5
              rounded-2xl
              border border-border/50
              bg-background/90
              backdrop-blur-xl
              shadow-xl
              p-1.5
              overflow-visible
              animate-in fade-in zoom-in-95 duration-200
            "
          >
            {canSeeAllOptions && (
              <>
                {/* GENERAR COTIZACIÓN */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DropdownMenuItem
                        asChild
                        disabled={!canQuote}
                        className="p-0 focus:bg-transparent"
                      >
                        <button
                          onClick={() => {
                            setOpenDropdown(false)
                            setOpenConfirm(true)
                          }}
                          className={`
                            ${itemBase}
                            text-emerald-600
                            ${!canQuote ? disabledClass : ""}
                          `}
                        >
                          <Receipt className={iconBase} />
                        </button>
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>

                  <TooltipContent>
                    {quoteTooltip}
                  </TooltipContent>
                </Tooltip>

                {/* RECHAZAR */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DropdownMenuItem
                        asChild
                        disabled={!canReject}
                        className="p-0 focus:bg-transparent"
                      >
                        <button
                          onClick={() => {
                            setOpenDropdown(false)
                            setOpenReject(true)
                          }}
                          className={`
                            ${itemBase}
                            text-orange-600
                            ${!canReject ? disabledClass : ""}
                          `}
                        >
                          <ClipboardX className={iconReject} />
                        </button>
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>

                  <TooltipContent>
                    {rejectTooltip}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* PDF */}
            <PDFDownloadLink
              fileName={`${req.order_number}.pdf`}
              document={
                <RequisitionReportPdf requisition={req} />
              }
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    asChild
                    className="p-0 focus:bg-transparent"
                  >
                    <button
                      className={`
                        ${itemBase}
                        text-blue-600
                      `}
                    >
                      <FileDown className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </TooltipTrigger>

                <TooltipContent>
                  Descargar PDF
                </TooltipContent>
              </Tooltip>
            </PDFDownloadLink>

            {/* CAMBIAR PRIORIDAD */}
            {canChangePriority && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      disabled={!canChangePriorityStatus}
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(false)
                          setOpenPriority(true)
                        }}
                        className={`
                          ${itemBase}
                          text-amber-600
                          ${!canChangePriorityStatus ? disabledClass : ""}
                        `}
                      >
                        <Tag className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  {priorityTooltip}
                </TooltipContent>
              </Tooltip>
            )}

            {/* ELIMINAR */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  asChild
                  className="p-0 focus:bg-transparent"
                >
                  <button
                    onClick={() => {
                      setOpenDropdown(false)
                      setOpenDelete(true)
                    }}
                    className={`
                      ${itemBase}
                      text-red-600
                    `}
                  >
                    <Trash2 className={iconBase} />
                  </button>
                </DropdownMenuItem>
              </TooltipTrigger>

              <TooltipContent>
                Eliminar solicitud
              </TooltipContent>
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>

        <RequisitionDropdownDialogs
          req={req}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
        />

        {canChangePriority && (
          <UpdateRequisitionPriorityDialog
            req={req}
            open={openPriority}
            setOpen={setOpenPriority}
          />
        )}
      </>
    </TooltipProvider>
  )
}

export default RequisitionDropdownActions