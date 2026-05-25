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
  ClipboardCheck,
  ClipboardX,
  Trash2
} from "lucide-react"
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"
import { Quote } from "@/types"

/* =========================
   STYLES
========================= */

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

/* =========================
   TYPES
========================= */

type Props = {
  quote: Quote
  onSuccessUpdate?: () => Promise<any>
}

/* =========================
   COMPONENT
========================= */

export default function QuoteActions({
  quote,
  onSuccessUpdate
}: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const userRoles =
    user?.roles?.map((r: any) => r.name) || []

  const isFinalState =
    quote.status === "APROBADO" ||
    quote.status === "RECHAZADA"

  const canAct = !isFinalState

  const canDelete = quote.status === "PENDIENTE"

  const approveTooltip =
    quote.status === "APROBADO"
      ? "Ya está aprobada"
      : quote.status === "RECHAZADA"
      ? "No se puede aprobar una cotización rechazada"
      : "Aprobar cotización"

  const rejectTooltip =
    quote.status === "APROBADO"
      ? "Ya está aprobada"
      : quote.status === "RECHAZADA"
      ? "Ya fue rechazada"
      : "Rechazar cotización"

  const handleSuccessUpdate = async () => {
    await onSuccessUpdate?.()
  }

  const handleSuccessDelete = () => {
    router.push(
      `/${selectedCompany!.slug}/compras/cotizaciones`
    )
    router.refresh()
  }

  if (!selectedCompany) return null

  return (
    <TooltipProvider delayDuration={120}>
      <div className={toolbar}>

        {/* =========================
            APPROVE
        ========================= */}
        {userRoles.includes("ANALISTA_COMPRAS") ||
        userRoles.includes("JEFE_COMPRAS") ||
        userRoles.includes("SUPERUSER") ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canAct}
                onClick={() => setOpenApprove(true)}
                className={`${itemBase} text-emerald-600`}
              >
                <ClipboardCheck className={iconBase} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{approveTooltip}</TooltipContent>
          </Tooltip>
        ) : null}

        {/* =========================
            REJECT
        ========================= */}
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

        {/* =========================
            DELETE
        ========================= */}
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

            <TooltipContent>
              Eliminar cotización
            </TooltipContent>
          </Tooltip>
        )}

        {/* =========================
            DIALOGS
        ========================= */}
        <QuoteDropdownDialogs
          quote={quote}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
          openReject={openReject}
          setOpenReject={setOpenReject}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          onSuccessUpdate={handleSuccessUpdate}
          onSuccessDelete={handleSuccessDelete}
        />

      </div>
    </TooltipProvider>
  )
}