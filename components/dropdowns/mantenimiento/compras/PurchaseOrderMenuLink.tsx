"use client"

import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useGetPurchaseOrderByQuoteId } from "@/hooks/mantenimiento/compras/useGetPurchaseOrderByQuoteId"
import { isAeronauticalPurchaseOrder } from "@/lib/purchases/purchase-order-scope"
import { cn } from "@/lib/utils"
import { RowAction, rowActionBarItemClass } from "./RowAction"

type Props = {
  company: string
  quoteId: number
  enabled: boolean
  itemClassName: string
  iconClassName: string
  /** En la barra del panel lateral en vez de dentro del menú flotante. */
  inBar?: boolean
}

const PurchaseOrderMenuLink = ({
  company,
  quoteId,
  enabled,
  itemClassName,
  iconClassName,
  inBar = false
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

  const orderItems = orders.map((po) => (
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
        <span className="truncate text-xs text-muted-foreground">
          {po.order_number}
        </span>
      </span>

      <ExternalLink className="size-3.5 shrink-0 text-primary" />
    </DropdownMenuItem>
  ))

  const listClassName =
    "rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-1.5 w-64"

  const listHeading = (
    <p className="px-2.5 pt-1.5 pb-2 text-xs tracking-wide text-muted-foreground select-none">
      ÓRDENES DE COMPRA
    </p>
  )

  if (inBar) {
    if (!hasMultiple) {
      return (
        <RowAction
          inBar
          icon={ExternalLink}
          tone="text-primary"
          title={tooltipLabel}
          disabled={!orders.length}
          onSelect={() => hasSingle && goToPO(orders[0].order_number)}
        />
      )
    }

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={tooltipLabel}
                className={cn(rowActionBarItemClass, "text-primary")}
              >
                <ExternalLink className="size-4 transition-transform duration-200 group-hover:scale-110" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="center" className={listClassName}>
          {listHeading}
          {orderItems}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (hasMultiple) {
    return (
      <DropdownMenuSub>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuSubTrigger
              className={cn(
                itemClassName,
                "text-primary [&>svg:last-child]:hidden"
              )}
            >
              <ExternalLink className={iconClassName} />
            </DropdownMenuSubTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>

        <DropdownMenuSubContent className={listClassName}>
          {listHeading}
          {orderItems}
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
              className={cn(itemClassName, "text-primary")}
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
