'use client'

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useRegisterGeneralArticlesDelivery } from "@/actions/mantenimiento/compras/ordenes_compras/actions"
import RegisterGeneralArticlesDeliveryDialog from "./_components/RegisterGeneralArticlesDeliveryDialog"
import EyePreviewIcon from "@/components/misc/EyePreviewIcon"

const ArticlesCountAction = ({
  po,
  company,
}: {
  po: PurchaseOrder
  company?: string
}) => {
  const [open, setOpen] = useState(false)
  const { registerGeneralArticlesDelivery } = useRegisterGeneralArticlesDelivery()
  const { user } = useAuth()

  const canRegister = useMemo(
    () => (user?.roles ?? []).some((r) => r.name === "ASISTENTE_COMPRAS" || r.name === "SUPERUSER"),
    [user?.roles]
  )

  const count =
    (po.article_purchase_order?.length ?? 0) +
    (po.general_article_purchase_order?.length ?? 0)

  const isEmpty = count === 0
  const generalArticles = po.general_article_purchase_order ?? []
  // Elegible si nunca se registró entrega o si la entrada fue rechazada por
  // almacén y debe volver a entregarse (ver RegisterGeneralArticlesDeliveryDialog).
  const pendingGeneralArticles = generalArticles.filter(
    (item) => !item.general_article_intake || item.general_article_intake.status === 'REJECTED'
  )
  const hasGeneralArticles = generalArticles.length > 0
  const hasPendingDelivery = pendingGeneralArticles.length > 0
  const canRegisterDelivery = hasGeneralArticles && !!company && canRegister

  const badge = (
    <div
      className={cn(
        `
          relative
          flex items-center justify-center
          px-2 py-0.5
          rounded-md
          text-xs tabular-nums
          border
          transition-colors
          bg-white/60 dark:bg-slate-900/30
          border-slate-200/60 dark:border-slate-700/50
          text-slate-600 dark:text-slate-300
        `,
        canRegisterDelivery && hasPendingDelivery && "cursor-pointer hover:bg-emerald-50 hover:border-emerald-300/60 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-700/50"
      )}
    >
      {hasPendingDelivery && !registerGeneralArticlesDelivery.isPending && (
        <span className="pointer-events-none absolute inset-0 rounded-md animate-[glow-pulse_6s_ease-in-out_infinite]" />
      )}

      {registerGeneralArticlesDelivery.isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <span className="font-medium">
          {count}
        </span>
      )}

      <span className="ml-1 text-muted-foreground">
        {count === 1 ? "artículo" : "artículos"}
      </span>

      {isEmpty && (
        <span className="ml-1 text-[10px] text-muted-foreground/70">
          vacío
        </span>
      )}
    </div>
  )

  if (!canRegisterDelivery) {
    return badge
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (registerGeneralArticlesDelivery.isPending) return

    if (!hasPendingDelivery) {
      toast.info("Ya se registró la entrega", {
        description: "Todos los artículos de esta orden de compra ya fueron entregados.",
      })
      return
    }

    setOpen(true)
  }

  return (
    <>
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={registerGeneralArticlesDelivery.isPending}
              onClick={handleTriggerClick}
              className="inline-flex disabled:opacity-60"
            >
              {badge}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {hasPendingDelivery
              ? "Registrar la entrega de los artículos generales de esta orden"
              : "Todos los artículos ya fueron entregados"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {company && (
        <RegisterGeneralArticlesDeliveryDialog
          po={po}
          company={company}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  )
}

const PO_STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  PAID: 'PAGADA',
  COMPLETED: 'COMPLETADA',
}

export const getColumns = (
  selectedCompany?: { slug: string },
  onPreview?: (po: PurchaseOrder) => void,
  selectedPreviewId?: number | null
): ColumnDef<PurchaseOrder>[] => [

  {
    accessorKey: "order_number",
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. Orden" />
      </div>
    ),

    meta: {
      title: "Nro. Orden",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/ordenes_compra_generales/${row.original.order_number}`}
          onClick={(e) => e.stopPropagation()}
          className="
            text-sm font-semibold
            text-slate-700 dark:text-slate-200

            hover:text-emerald-600
            dark:hover:text-emerald-400

            transition-colors
          "
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },

  {
    id: "preview",
    size: 40,
    header: () => null,
    cell: ({ row }) => {
      const isActive = selectedPreviewId === row.original.id

      return (
        <div className="flex justify-center px-0" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onPreview?.(row.original)}
                  className={cn(
                    'flex items-center justify-center rounded-md p-1 transition-all duration-200',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_6px_rgba(37,99,235,0.65)] dark:drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]'
                      : 'text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:drop-shadow-[0_0_6px_rgba(37,99,235,0.55)] dark:hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]'
                  )}
                >
                  <EyePreviewIcon active={isActive} className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{isActive ? 'Cerrar vista previa' : 'Vista previa de la orden de compra'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "quote_order",
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cotización" />
      </div>
    ),

    meta: {
      title: "Cotización",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/cotizaciones_generales/${row.original.quote_order?.quote_number}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-400 hover:underline underline-offset-4 decoration-1"
        >
            
          {row.original.quote_order?.quote_number ?? "—"}

        </Link>
      </div>
    ),
  },

  {
    accessorKey: "retailer",
    size: 240,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Comercio" />
      </div>
    ),

    meta: {
      title: "Comercio",
    },

    cell: ({ row }) => {
      const name = row.original.retailer?.name

      if (!name) {
        return (
          <div className="flex justify-center w-full">
            <span className="text-sm text-muted-foreground">N/A</span>
          </div>
        )
      }

      return (
        <div className="flex justify-center w-full min-w-0">
          <span className="block w-full max-w-[220px] whitespace-normal break-words text-center text-sm font-medium text-slate-700 dark:text-slate-200">
            {name}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: "purchase_date",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Creación" />
      </div>
    ),

    meta: {
      title: "Fecha de Creación",
    },

    cell: ({ row }) => {
      const date = new Date(row.original.purchase_date);

      return (
        <div className="flex justify-center w-full">
          <span className="text-s text-slate-600 dark:text-slate-300 text-center font-medium tracking-wide uppercase">
            {format(date, "dd MMM yyyy", { locale: es })}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    meta: {
      title: "Estado",
    },

    cell: ({ row }) => {
      const status = row.original.status

      const completed = status === "COMPLETED"
      const paid = status === "PAID"

      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(
              `
                rounded-md
                border
                px-2 py-0.5
                text-[10px]
                font-semibold
                tracking-wide
                shadow-sm
                transition-colors duration-150
                cursor-default
              `,

              paid && `
                border-yellow-500/30
                bg-yellow-500/10
                text-yellow-700
                dark:text-yellow-300
                hover:bg-yellow-500/15
              `,

              completed && `
                border-emerald-500/30
                bg-emerald-500/10
                text-emerald-700
                dark:text-emerald-300
                hover:bg-emerald-500/15
              `,

              !paid &&
                !completed &&
                `
                  border-red-500/30
                  bg-red-500/10
                  text-red-700
                  dark:text-red-300
                  hover:bg-red-500/15
                `
            )}
          >
            {PO_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      )
    },
  },

  {
    accessorKey: "articles",
    size: 150,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),

    meta: {
      title: "Artículos",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <ArticlesCountAction po={row.original} company={selectedCompany?.slug} />
      </div>
    ),
  },

  {
    id: "actions",
    size: 80,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: {
      title: "Acciones",
    },
    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseOrderDropdownActions po={row.original} />
      </div>
    ),
  },
]