"use client"

import { useState } from "react"
import { PurchaseOrder } from "@/types"
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
  Minus,
  MoreHorizontal
} from "lucide-react"
import PurchaseOrderDropdownDialogs from "@/components/dialogs/mantenimiento/compras/PurchaseOrderDropdownDialogs"

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

const PurchaseOrderDropdownActions = ({
  po
}: {
  po: PurchaseOrder
}) => {
  const [openDropdown, setOpenDropdown] =
    useState(false)
  const [openApprove, setOpenApprove] =
    useState(false)
  const isInactive =
    po.status?.toUpperCase() === "PAGADO"

  return (
    <TooltipProvider delayDuration={120}>
      <>
        {isInactive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 cursor-not-allowed"
              >
                <Minus className="h-4 w-4 text-muted-foreground/30" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              No hay acciones disponibles para una orden de compra pagada.
            </TooltipContent>
          </Tooltip>
        ) : (
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
              {/* COMPLETE PURCHASE */}
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
                        className={`
                          ${itemBase}
                          text-emerald-600
                        `}
                      >
                        <ClipboardCheck
                          className={iconBase}
                        />
                      </button>
                    </DropdownMenuItem>
                  </span>
                </TooltipTrigger>

                <TooltipContent>
                  Completar compra
                </TooltipContent>
              </Tooltip>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <PurchaseOrderDropdownDialogs
          po={po}
          openApprove={openApprove}
          setOpenApprove={setOpenApprove}
        />
      </>
    </TooltipProvider>
  )
}

export default PurchaseOrderDropdownActions