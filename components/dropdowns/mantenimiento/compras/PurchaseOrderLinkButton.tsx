"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useGetPurchaseOrderByQuoteId } from "@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId"
import { cn } from "@/lib/utils"

type Props = {
  company: string
  quoteId: number
  enabled: boolean
  className?: string
  iconClassName?: string
}

const PurchaseOrderLinkButton = ({
  company,
  quoteId,
  enabled,
  className,
  iconClassName
}: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { data: purchaseOrders, isFetching } = useGetPurchaseOrderByQuoteId({
    company,
    quoteId,
    enabled
  })

  const orders = purchaseOrders ?? []
  const hasSingle = orders.length === 1
  const hasMultiple = orders.length > 1

  const goToPO = (orderNumber: string) => {
    setOpen(false)
    router.push(`/${company}/compras/ordenes_compra/${orderNumber}`)
  }

  const handleClick = () => {
    if (hasSingle) goToPO(orders[0].order_number)
  }

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      disabled={!orders.length}
      onClick={hasMultiple ? undefined : handleClick}
      className={cn(className, "text-indigo-600")}
    >
      <ExternalLink className={iconClassName} />
    </Button>
  )

  const tooltipLabel = isFetching
    ? "Cargando..."
    : hasMultiple
    ? "Ver órdenes de compra"
    : orders.length
    ? "Ver orden de compra"
    : "No existe orden de compra"

  if (!hasMultiple) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="center"
        className="w-64 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-1.5"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[10px] tracking-wide text-muted-foreground select-none">
          ÓRDENES DE COMPRA
        </p>

        <div className="flex flex-col gap-0.5">
          {orders.map((po) => (
            <button
              key={po.id}
              onClick={() => goToPO(po.order_number)}
              className="
                flex items-center justify-between gap-2
                rounded-xl px-2.5 py-2
                text-left text-sm
                transition-colors
                hover:bg-muted
              "
            >
              <span className="flex flex-col min-w-0">
                <span className="truncate font-medium text-foreground">
                  {po.vendor_name ?? "Sin proveedor"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {po.order_number}
                </span>
              </span>

              <ExternalLink className="size-3.5 shrink-0 text-indigo-600" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PurchaseOrderLinkButton
