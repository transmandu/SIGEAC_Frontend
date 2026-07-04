'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import RequisitionsDropdownActions from '@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Requisition } from '@/types/purchase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronRight, Eye, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useUpdateRequisitionStatus } from '@/actions/mantenimiento/compras/requisiciones/actions'

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'CREADA',
  RECEIVED: 'RECIBIDA',
  IN_PROGRESS: 'EN PROCESO',
  QUOTED: 'COTIZADA',
  APPROVED: 'APROBADA',
  REJECTED: 'RECHAZADA',
}

const statusLabel = (status?: string) => STATUS_LABELS[status ?? ''] ?? status ?? '—'

const statusBadgeClass = (status?: string) => {
  const created = status === 'CREATED'
  const received = status === 'RECEIVED'
  const process = status === 'IN_PROGRESS' || status === 'QUOTED'
  const approved = status === 'APPROVED'

  return cn(
    'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 hover:scale-100 hover:translate-y-0',
    created && 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/15 dark:hover:text-slate-200',
    received && 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 dark:hover:text-sky-200',
    process && 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200',
    approved && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200',
    !created && !received && !process && !approved && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200'
  )
}

const NEXT_STATUS: Record<string, string> = {
  CREATED: 'RECEIVED',
  RECEIVED: 'IN_PROGRESS',
}

const ADVANCE_TOOLTIP: Record<string, string> = {
  CREATED: 'Marcar esta requisición como recibida',
  RECEIVED: 'Iniciar proceso de atención / ejecución',
}

const StatusCell = ({ requisition }: { requisition: Requisition }) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()
  const { updateStatusRequisition } = useUpdateRequisitionStatus()

  const status = requisition.status
  const nextStatus = NEXT_STATUS[status as string]
  const isClickable = !!nextStatus && !!selectedCompany

  const badge = (
    <Badge
      className={cn(
        statusBadgeClass(status),
        isClickable ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (!isClickable || updateStatusRequisition.isPending) return

        updateStatusRequisition.mutate({
          id: requisition.id,
          data: {
            status: nextStatus,
            updated_by: `${user?.first_name} ${user?.last_name}`,
          },
          company: selectedCompany!.slug,
        })
      }}
    >
      {updateStatusRequisition.isPending && (
        <Loader2 className="mr-1 size-3 animate-spin" />
      )}
      {statusLabel(status)}
    </Badge>
  )

  if (!isClickable) {
    return badge
  }

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent>{ADVANCE_TOOLTIP[status as string]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const getColumns = (
  selectedCompany?: { slug: string },
  onPreview?: (requisition: Requisition) => void
): ColumnDef<Requisition>[] => [
  {
    id: 'expander',
    size: 50,
    header: () => null,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      return (
        <div className="flex justify-center w-full">
          {canExpand ? (
            <ChevronRight
              className={cn(
                `size-3.5 text-muted-foreground/50 transition-transform duration-150`,

                row.getIsExpanded() &&
                  `rotate-90 text-emerald-600 dark:text-emerald-400
                  `
              )}
            />
          ) : (
            <div className="size-3.5" />
          )}

        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'order_number',
    size: 210,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          filter
          column={column}
          title="Nro. Req."
        />
      </div>
    ),

    meta: {
      title: 'Nro. Req.',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/requisiciones_generales/${row.original.order_number}`}
          className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'justification',
    size: 340,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Justificación"
        />
      </div>
    ),
    meta: {
      title: 'Justificación',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="block max-w-[400px]
            text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal break-words leading-snug"
          title={row.original.justification ?? ''}
        >
          {row.original.justification ?? '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'requested_by',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Solicitado por"
        />
      </div>
    ),
    meta: {
      title: 'Solicitado por',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center"
        >
          {row.original.requested_by ?? '—'}
        </span>
      </div>
    ),
  },
  {
    id: 'preview',
    size: 40,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center px-0" onClick={(e) => e.stopPropagation()}>
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onPreview?.(row.original)}
                className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-blue-600 hover:bg-blue-500/10 dark:hover:text-blue-400"
              >
                <Eye className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Vista previa de la requisición</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    size: 150,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Estado"
        />
      </div>
    ),
    meta: {
      title: 'Estado',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <StatusCell requisition={row.original} />
      </div>
    )
  },
  {
    accessorKey: 'priority',
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Prioridad"
        />
      </div>
    ),
    meta: {
      title: 'Prioridad',
    },
    cell: ({ row }) => {
      const priority = row.original.priority

      const config =
        priority === 'LOW'
          ? {
              label: 'BAJA',
              base: 'bg-green-500/10 text-green-600 dark:text-green-300',
              glow: 'shadow-green-400/30',
            }
          : priority === 'MEDIUM'
          ? {
              label: 'MEDIA',
              base: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
              glow: 'shadow-orange-500/30',
            }
          : priority === 'HIGH'
          ? {
              label: 'ALTA',
              base: 'bg-red-500/10 text-red-700 dark:text-red-300',
              glow: 'shadow-red-500/40',
            }
          : {
              label: '—',
              base: 'bg-slate-500/10 text-slate-400',
              glow: '',
            }

      return (
        <div className="flex justify-center w-full select-none">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-transparent",
              config.base,
              config.glow
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                priority === 'LOW' && "bg-green-400",
                priority === 'MEDIUM' && "bg-orange-500",
                priority === 'HIGH' && "bg-red-500"
              )}
            />
            {config.label}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'submission_date',
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Fecha de Creación"
        />
      </div>
    ),
    meta: {
      title: 'Fecha de Creación',
    },
    cell: ({ row }) => {
      const date = new Date(row.original.submission_date);

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
    id: 'actions',
    size: 80,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          column={column}
          title="Acciones"
        />
      </div>
    ),
    meta: {
      title: 'Acciones',
    },
    cell: ({ row }) => (
      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <RequisitionsDropdownActions
          req={row.original}
        />
      </div>
    ),
  },
]