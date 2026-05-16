"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Requisition } from "@/types"
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
  Trash2
} from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import RequisitionReportPdf from "@/components/pdf/almacen/RequisitionReportPdf"
import RequisitionDropdownDialogs from "@/components/dialogs/mantenimiento/compras/RequisitionDropdownDialogs"

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

  const userRoles = user?.roles?.map(role => role.name) || []

  const canQuote =
    !(req.status === "APROBADO" || req.status === "RECHAZADO")
  const canReject =
    !(req.status === "RECHAZADO" || req.status === "APROBADO")

  const quoteTooltip =
    req.status === "APROBADO"
      ? "Una cotización ya fue aprobada para esta requisición"
      : req.status === "RECHAZADO"
      ? "Esta requisición ha sido rechazada"
      : "Generar cotización"
  const rejectTooltip =
    req.status === "APROBADO"
      ? "Esta requisición ya fue aprobada"
      : req.status === "RECHAZADO"
      ? "Esta requisición ya fue rechazada"
      : "Rechazar solicitud"

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
            {(userRoles.includes("ANALISTA_COMPRAS") || userRoles.includes("JEFE_COMPRAS") ||
              userRoles.includes("SUPERUSER")) && (
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
      </>
    </TooltipProvider>
  )
}

export default RequisitionDropdownActions