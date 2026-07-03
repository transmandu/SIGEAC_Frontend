'use client'

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions"
import { CalendarIcon, ChevronRight, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useRegisterGeneralArticlesDelivery } from "@/actions/mantenimiento/compras/ordenes_compras/actions"

const ArticlesCountAction = ({
  po,
  company,
}: {
  po: PurchaseOrder
  company?: string
}) => {
  const [open, setOpen] = useState(false)
  const [arrivedAt, setArrivedAt] = useState<Date>(() => new Date())
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
  const pendingGeneralArticles = generalArticles.filter((item) => !item.general_article_intake)
  const hasGeneralArticles = generalArticles.length > 0
  const hasPendingDelivery = pendingGeneralArticles.length > 0
  const canRegisterDelivery = hasGeneralArticles && !!company && canRegister

  const badge = (
    <div
      className={cn(
        `
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

    setArrivedAt(new Date())
    setOpen(true)
  }

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return
    setArrivedAt((prev) => {
      const next = new Date(day)
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0)
      return next
    })
  }

  const handleTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    setArrivedAt((prev) => {
      const next = new Date(prev)
      next.setHours(hours, minutes, 0, 0)
      return next
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar entrega de artículos</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de registrar la entrega física de{" "}
            <span className="font-semibold text-foreground">{pendingGeneralArticles.length}</span>{" "}
            {pendingGeneralArticles.length === 1 ? "artículo general" : "artículos generales"} de la orden{" "}
            <span className="font-semibold text-foreground">{po.order_number}</span>.
            Esto creará las entradas pendientes de verificación en almacén.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Fecha y hora de llegada
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 flex-1 justify-start text-sm bg-background/70",
                    !arrivedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3 opacity-60" />
                  {format(arrivedAt, "dd MMM yyyy", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={arrivedAt}
                  onSelect={handleDateSelect}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Input
              type="time"
              value={format(arrivedAt, "HH:mm")}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-9 w-28 bg-background/70 text-sm"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={registerGeneralArticlesDelivery.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={registerGeneralArticlesDelivery.isPending}
            onClick={() =>
              registerGeneralArticlesDelivery.mutate({
                id: po.id,
                company: company!,
                arrivedAt,
              })
            }
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<PurchaseOrder>[] => [

  {
    id: "expander",
    size: 32,

    header: () => null,

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground/50 transition-transform duration-150",
            row.getIsExpanded() &&
              "rotate-90 text-emerald-600 dark:text-emerald-400"
          )}
        />
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  },

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
    accessorKey: "quote_order",
    size: 200,

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
            <span className="text-sm text-muted-foreground">—</span>
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
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Creación" />
      </div>
    ),

    meta: {
      title: "Fecha de Creación",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {format(new Date(row.original.purchase_date), "PPP", {
            locale: es,
          })}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "status",
    size: 180,

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

      const completed = status === "COMPLETADA"
      const paid = status === "PAGADA"

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
            {status}
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
    size: 100,
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