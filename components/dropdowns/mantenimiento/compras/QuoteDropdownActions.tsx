"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCompanyStore } from "@/stores/CompanyStore"
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
  ClipboardCheck,
  ClipboardX,
  ExternalLink,
  FileDown,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import type { Quote } from "@/types/purchase"
// import { PDFDownloadLink } from "@react-pdf/renderer"
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"
import { useGetPurchaseOrderByQuoteId } from "@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId"

const iconBase =
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

const QuoteDropdownActions = ({ quote }: { quote: Quote }) => {
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()

  const [openDropdown, setOpenDropdown] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const canDelete = quote.status !== "APROBADA"
  const canViewPO = quote.status === "APROBADA"
  const canApproveOrReject = quote.status === "PENDIENTE"

  const shouldFetchPO = canViewPO && !!selectedCompany?.slug && !!quote.id
  const {data: purchaseOrder, isFetching} = useGetPurchaseOrderByQuoteId({company: selectedCompany?.slug, quoteId: quote.id, enabled: shouldFetchPO})
  const handleGoToPO = () => {
    if (!purchaseOrder?.order_number || !selectedCompany) return
    router.push(`/${selectedCompany.slug}/compras/ordenes_compra/${purchaseOrder.order_number}`)
  }

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
            {/* APPROVE */}
            {canApproveOrReject && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(false)
                          setOpenApprove(true)
                        }}
                        className={`${itemBase} text-emerald-600`}
                      >
                        <ClipboardCheck className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Aprobar cotización
                </TooltipContent>
              </Tooltip>
            )}

            {/* REJECT */}
            {canApproveOrReject && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(false)
                          setOpenReject(true)
                        }}
                        className={`${itemBase} text-orange-600`}
                      >
                        <ClipboardX className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Rechazar cotización
                </TooltipContent>
              </Tooltip>
            )}

            {/* PDF */}
            {/* <PDFDownloadLink
              fileName={`${quote.quote_number}.pdf`}
              document={
                < quote={quote} />
              }
            > */}
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
                  ¡Próximamente!
                </TooltipContent>
              </Tooltip>
            {/* </PDFDownloadLink> */}

            {/* PO LINK */}
            {canViewPO && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!purchaseOrder?.order_number}
                    onClick={handleGoToPO}
                    className={`${itemBase} text-indigo-600`}
                  >
                    <ExternalLink className={iconBase} />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  {isFetching
                    ? "Cargando..."
                    : purchaseOrder?.order_number
                    ? "Ver orden de compra"
                    : "No existe orden de compra"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* DELETE */}
            {canDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <DropdownMenuItem
                      asChild
                      className="p-0 focus:bg-transparent"
                    >
                      <button
                        onClick={() => {
                          setOpenDropdown(false)
                          setOpenDelete(true)
                        }}
                        className={`${itemBase} text-red-600`}
                      >
                        <Trash2 className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Eliminar cotización
                </TooltipContent>
              </Tooltip>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <QuoteDropdownDialogs
          quote={quote}
          openDelete={openDelete}
          setOpenDelete={setOpenDelete}
          openReject={openReject}
          setOpenReject={setOpenReject}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
        />
      </>
    </TooltipProvider>
  )
}

export default QuoteDropdownActions