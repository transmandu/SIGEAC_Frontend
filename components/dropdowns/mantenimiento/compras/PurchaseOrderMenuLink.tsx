"use client"

import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useGetPurchaseOrderByQuoteId } from "@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId"
import { isAeronauticalPurchaseOrder } from "@/lib/purchases/purchase-order-scope"
import { cn } from "@/lib/utils"

type Props = {
  company: string
  quoteId: number
  enabled: boolean
  itemClassName: string
  iconClassName: string
}

const PurchaseOrderMenuLink = ({
  company,
  quoteId,
  enabled,
  itemClassName,
  iconClassName
}: Props) => {
  const router = useRouter()

  const { data: purchaseOrders, isFetching } = useGetPurchaseOrderByQuoteId({
    company,
    quoteId,
    enabled
  })

  const orders = purchaseOrders ?? []
  const hasSingle = orders.length === 1
  const hasMultiple = orders.length > 1

  const goToPO = (orderNumber: string) => {
    const segment = isAeronauticalPurchaseOrder(orderNumber)
      ? "ordenes_compra"
      : "ordenes_compra_generales"
    router.push(`/${company}/compras/${segment}/${orderNumber}`)
  }

  const tooltipLabel = isFetching
    ? "Cargando..."
    : hasMultiple
    ? "Ver órdenes de compra"
    : orders.length
    ? "Ver orden de compra"
    : "No existe orden de compra"

  if (hasMultiple) {
    return (
      <DropdownMenuSub>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuSubTrigger
              className={cn(
                itemClassName,
                "text-indigo-600 [&>svg:last-child]:hidden"
              )}
            >
              <ExternalLink className={iconClassName} />
            </DropdownMenuSubTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>

        <DropdownMenuSubContent
          className="
            rounded-2xl border border-border/50 bg-background/95
            backdrop-blur-xl shadow-xl p-1.5 w-64
          "
        >
          <p className="px-2.5 pt-1.5 pb-2 text-[10px] tracking-wide text-muted-foreground select-none">
            ÓRDENES DE COMPRA
          </p>

          {orders.map((po) => (
            <DropdownMenuItem
              key={po.id}
              onClick={() => goToPO(po.order_number)}
              className="
                flex items-center justify-between gap-2
                rounded-xl px-2.5 py-2
                cursor-pointer
              "
            >
              <span className="flex flex-col min-w-0">
                <span className="truncate font-medium text-foreground">
                  {po.vendor_name ?? po.retailer_name ?? "Sin proveedor"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {po.order_number}
                </span>
              </span>

              <ExternalLink className="size-3.5 shrink-0 text-indigo-600" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <DropdownMenuItem
            asChild
            disabled={!orders.length}
            className="p-0 focus:bg-transparent"
          >
            <button
              onClick={() => hasSingle && goToPO(orders[0].order_number)}
              disabled={!orders.length}
              className={cn(itemClassName, "text-indigo-600")}
            >
              <ExternalLink className={iconClassName} />
            </button>
          </DropdownMenuItem>
        </span>
      </TooltipTrigger>

      <TooltipContent>{tooltipLabel}</TooltipContent>
    </Tooltip>
  )
}

export default PurchaseOrderMenuLink
