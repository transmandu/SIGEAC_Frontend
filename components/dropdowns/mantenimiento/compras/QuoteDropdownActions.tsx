"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
  AlertOctagon,
  ClipboardCheck,
  ClipboardX,
  FileDown,
  MoreHorizontal,
  PackagePlus,
  Trash2
} from "lucide-react"
import type { Quote } from "@/types/purchase"
// import { PDFDownloadLink } from "@react-pdf/renderer"
import QuoteDropdownDialogs from "@/components/dialogs/mantenimiento/compras/QuoteDropdownDialogs"
import PurchaseOrderMenuLink from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderMenuLink"
import CreateComplementaryQuoteDialog from "@/app/[company]/compras/(general)/cotizaciones_generales/[quote_number]/_components/CreateComplementaryQuoteDialog"

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
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const [openDropdown, setOpenDropdown] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openApprove, setOpenApprove] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openCascadeDelete, setOpenCascadeDelete] = useState(false)
  const [openComplementary, setOpenComplementary] = useState(false)

  const canDelete = quote.status !== "APPROVED"
  const canViewPO = quote.status === "APPROVED"
  const canApproveOrReject = quote.status === "PENDING"
  const isSuperUser = (user?.roles?.map((role) => role.name) || []).includes("SUPERUSER")

  // Cotización complementaria: solo sobre una original APROBADA con
  // artículos generales cotizados. Registra la diferencia entre lo comprado
  // realmente y lo amparado, sin editar los documentos ya pagados.
  const canCreateComplementary =
    quote.status === "APPROVED" &&
    !quote.parent_quote_order &&
    (quote.general_article_quote_order ?? []).some((i) => !i.is_not_quoted)

  const shouldFetchPO = canViewPO && !!selectedCompany?.slug && !!quote.id

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

            {/* COMPLEMENTARY QUOTE */}
            {canCreateComplementary && (
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
                          setOpenComplementary(true)
                        }}
                        className={`${itemBase} text-violet-600`}
                      >
                        <PackagePlus className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Crear cotización complementaria
                </TooltipContent>
              </Tooltip>
            )}

            {/* PO LINK */}
            {canViewPO && selectedCompany?.slug && (
              <PurchaseOrderMenuLink
                company={selectedCompany.slug}
                quoteId={quote.id}
                enabled={shouldFetchPO}
                itemClassName={itemBase}
                iconClassName={iconBase}
              />
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

            {/* CASCADE DELETE (SUPERUSER) */}
            {isSuperUser && (
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
                          setOpenCascadeDelete(true)
                        }}
                        className={`${itemBase} text-red-700`}
                      >
                        <AlertOctagon className={iconBase} />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Eliminar en cascada (SuperUser)
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
          openCascadeDelete={openCascadeDelete}
          setOpenCascadeDelete={setOpenCascadeDelete}
        />

        {selectedCompany?.slug && (
          <CreateComplementaryQuoteDialog
            quote={quote}
            company={selectedCompany.slug}
            open={openComplementary}
            onOpenChange={setOpenComplementary}
          />
        )}
      </>
    </TooltipProvider>
  )
}

export default QuoteDropdownActions