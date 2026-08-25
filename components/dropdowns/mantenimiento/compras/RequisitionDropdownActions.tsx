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
  AlertOctagon,
  ClipboardX,
  FileDown,
  MoreHorizontal,
  Receipt,
  Tag,
  Trash2
} from "lucide-react"
import DownloadRequisitionPdfDialog from "@/components/dialogs/mantenimiento/compras/DownloadRequisitionPdfDialog"
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
const RequisitionDropdownActions = ({
  req
}: {
  req: Requisition
}) => {
  const { user } = useAuth()

  const [openDropdown, setOpenDropdown] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openPriority, setOpenPriority] = useState(false)
  const [openPdf, setOpenPdf] = useState(false)

  const userRoles = user?.roles?.map(role => role.name) || []
  const isOwnRequisition = req.created_by?.id === user?.id
  const canChangePriority = ["JEFE_ALMACEN", "SUPERUSER"].some(role =>
    userRoles.includes(role)
  );
  const canSeeAllOptions = ["JEFE_COMPRAS", "ANALISTA_COMPRAS","ASISTENTE_COMPRAS", "SUPERUSER"].some(role =>
    userRoles.includes(role)
  );
  // JEFE_ALMACEN puede eliminar cualquier solicitud de almacén, pero no
  // cotizar ni rechazar (eso queda reservado a compras).
  const canDeleteAny = ["JEFE_ALMACEN", "SUPERUSER"].some(role =>
    userRoles.includes(role)
  );
  // ANALISTA_ALMACEN es de solo lectura: únicamente puede eliminar sus
  // propias solicitudes, nada más.
  const isReadOnlyWarehouseAnalyst =
    userRoles.includes("ANALISTA_ALMACEN") && !canDeleteAny && !canSeeAllOptions
  const isSuperUser = userRoles.includes("SUPERUSER")

  // Una solicitud no aprobada esta cerrada: el motivo del rechazo vive en su
  // observacion y debe perdurar. Solo queda el PDF; cambiarle la prioridad no
  // hace nada y borrarla se llevaria la constancia de por que se rechazo.
  const isRejected = req.status === "REJECTED"

  // Solo se borra mientras la solicitud es asunto de quien la creo. Desde
  // EN PROCESO ya hay compras trabajando sobre ella (y posibles cotizaciones
  // colgando), asi que sacarla de circulacion deja de ser decision del usuario
  // ordinario. REJECTED tampoco entra: queda como constancia.
  const isDeletableStatus =
    req.status === "CREATED" || req.status === "RECEIVED"

  const canDelete =
    isDeletableStatus &&
    (canDeleteAny || (isReadOnlyWarehouseAnalyst && isOwnRequisition))

  const canQuote =
    canSeeAllOptions &&
    !(req.status === "APPROVED" || isRejected)
  const canReject =
    canSeeAllOptions &&
    !(isRejected || req.status === "APPROVED")
  const canChangePriorityStatus =
    !(req.status === "APPROVED" || req.status === "QUOTED" || isRejected)

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
            {/* GENERAR COTIZACIÓN */}
            {canQuote && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    asChild
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
                      `}
                    >
                      <Receipt className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </TooltipTrigger>

                <TooltipContent>
                  Generar cotización
                </TooltipContent>
              </Tooltip>
            )}

            {/* RECHAZAR */}
            {canReject && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    asChild
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
                      `}
                    >
                      <ClipboardX className={iconReject} />
                    </button>
                  </DropdownMenuItem>
                </TooltipTrigger>

                <TooltipContent>
                  Rechazar solicitud
                </TooltipContent>
              </Tooltip>
            )}

            {/* PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  asChild
                  className="p-0 focus:bg-transparent"
                >
                  <button
                    onClick={() => {
                      setOpenDropdown(false)
                      setOpenPdf(true)
                    }}
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

            {/* CAMBIAR PRIORIDAD */}
            {canChangePriority && canChangePriorityStatus && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    asChild
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
                      `}
                    >
                      <Tag className={iconBase} />
                    </button>
                  </DropdownMenuItem>
                </TooltipTrigger>

                <TooltipContent>
                  Cambiar prioridad
                </TooltipContent>
              </Tooltip>
            )}

            {/* ELIMINAR */}
            {canDelete && (
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
            )}

            {/* ELIMINAR EN CASCADA (SUPERUSER) */}
            {isSuperUser && (
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  asChild
                  className="p-0 focus:bg-transparent"
                >
                  <button
                    onClick={() => {
                      setOpenDropdown(false)
                      setOpenCascadeDelete(true)
                    }}
                    className={`
                      ${itemBase}
                      text-red-700
                    `}
                  >
                    <AlertOctagon className={iconBase} />
                  </button>
                </DropdownMenuItem>
              </TooltipTrigger>

              <TooltipContent>
                Eliminar en cascada (SuperUser)
              </TooltipContent>
            </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <RequisitionDropdownDialogs
          req={req}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          openReject={openReject}
          setOpenReject={setOpenReject}
        />

        <DownloadRequisitionPdfDialog
          req={req}
          open={openPdf}
          onOpenChange={setOpenPdf}
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