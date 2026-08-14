'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatQuarantineDate, quarantineRisk } from '@/lib/warehouse/quarantine'
import type { QuarantineRecord } from '@/types/quarantine'
import { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileWarning,
  Repeat2,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { ResolveQuarantineDialog } from './_components/ResolveQuarantineDialog'

const pendingDocumentCount = (record: QuarantineRecord) =>
  (record.article?.document_requirements ?? []).filter((req) => req.documents.length === 0).length

/**
 * Acción de compras. Solo los OPEN se resuelven: los ya enviados a
 * re-inspección están en manos del inspector, y sobre esos compras solo
 * consulta — por eso ahí no se renderiza ningún botón en vez de uno inerte.
 */
function ResolveAction({ record }: { record: QuarantineRecord }) {
  const [open, setOpen] = useState(false)

  const pendingDocs = pendingDocumentCount(record)

  if (record.status !== 'OPEN') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {record.status === 'PENDING_REINSPECTION' ? (
                <>
                  <ShieldCheck className="size-3.5 text-sky-500" />
                  En calidad
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Resuelto
                </>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-2 py-1 text-xs">
            {record.status === 'PENDING_REINSPECTION'
              ? 'Ya corregido: espera la re-inspección de Control de Calidad'
              : 'El artículo salió del ciclo de cuarentena'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="h-7 gap-1.5 rounded-full border border-slate-200/60 bg-white/50 px-3 text-[11px] hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/40 dark:hover:bg-slate-800"
      >
        {pendingDocs > 0 ? (
          <FileWarning className="size-3 text-amber-500" />
        ) : (
          <Wrench className="size-3" />
        )}
        Resolver
        {pendingDocs > 0 && (
          <span className="flex size-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-semibold text-white">
            {pendingDocs}
          </span>
        )}
      </Button>

      {open && (
        <ResolveQuarantineDialog record={record} open={open} onOpenChange={setOpen} />
      )}
    </>
  )
}

export const getColumns = (legalDays: number): ColumnDef<QuarantineRecord>[] => [
  {
    id: 'expander',
    size: 50,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        {row.getCanExpand() && (
          <ChevronRight
            className={cn(
              'size-3.5 text-muted-foreground/50 transition-transform',
              row.getIsExpanded() && 'rotate-90 text-emerald-500',
            )}
          />
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'article.part_number',
    size: 210,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader filter column={column} title="Número de Parte" />
      </div>
    ),

    cell: ({ row }) => {
      const article = row.original.article
      const serial = article?.serial

      return (
        <div className="flex w-full justify-start">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="select-none rounded-md border border-emerald-200/50 bg-emerald-100/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-300">
                P/N
              </span>
              <span className="rounded px-1 py-0.5 text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {article?.part_number ?? 'Sin parte'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest',
                  serial
                    ? 'border border-slate-300/40 bg-slate-200/60 text-slate-600 dark:border-slate-600/40 dark:bg-slate-700/40 dark:text-slate-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                )}
              >
                S/N
              </span>
              {serial ? (
                <span className="font-mono text-[11px] text-muted-foreground">{serial}</span>
              ) : (
                <span className="text-[11px] italic text-muted-foreground/40">Sin serial</span>
              )}
            </div>
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'article.batch.name',
    size: 190,

    header: ({ column }) => (
      <div className="flex w-full items-center justify-center text-center">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center px-2 text-center">
        <span className="block w-full break-words text-sm font-medium text-slate-800 dark:text-slate-200">
          {row.original.article?.batch?.name ?? 'Sin descripción'}
        </span>
      </div>
    ),
  },

  {
    id: 'reason',
    size: 260,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Motivo de la retención" />
      </div>
    ),

    accessorFn: (row) => row.reason,

    cell: ({ row }) => {
      const record = row.original
      const attempts = record.cycles?.length ?? 0

      return (
        <div className="space-y-1">
          <p className="max-w-[260px] text-sm text-slate-800 dark:text-slate-200">
            {record.reason}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              {record.inspector ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3" />
              {formatQuarantineDate(record.quarantine_entry_date)}
            </span>
            {attempts > 1 && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Repeat2 className="size-3" />
                {attempts} intentos
              </span>
            )}
          </div>
        </div>
      )
    },
  },

  {
    id: 'legal_window',
    size: 150,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Plazo legal" />
      </div>
    ),

    // Ordena por urgencia: lo vencido primero.
    accessorFn: (row) => {
      const risk = quarantineRisk(row.quarantine_entry_date, legalDays, row.days_in_quarantine)
      if (risk.days === null) return -1
      return risk.state === 'expired' ? 1000 + risk.days : risk.days
    },

    cell: ({ row }) => {
      const record = row.original
      const risk = quarantineRisk(record.quarantine_entry_date, legalDays, record.days_in_quarantine)

      if (risk.days === null) {
        return (
          <div className="flex w-full justify-center">
            <span className="text-xs text-muted-foreground/40">Sin fecha</span>
          </div>
        )
      }

      const expired = risk.state === 'expired'
      const warning = risk.state === 'warning'

      return (
        <div className="flex w-full flex-col items-center gap-1">
          <Badge
            className={cn(
              'select-none whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
              expired && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
              warning && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
              !expired && !warning && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            )}
          >
            {expired ? 'Vencido' : warning ? 'Por vencer' : 'En plazo'}
          </Badge>

          <span className="text-sm font-semibold tabular-nums">
            {risk.days} / {legalDays}
          </span>

          <span className="text-[10px] tabular-nums text-muted-foreground">
            {risk.remaining !== null && risk.remaining >= 0
              ? `Restan ${risk.remaining} días`
              : `Vencido por ${Math.abs(risk.remaining ?? 0)} días`}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    size: 170,

    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    cell: ({ row }) => {
      const status = row.original.status

      const isOpen = status === 'OPEN'
      const isPending = status === 'PENDING_REINSPECTION'

      return (
        <div className="flex w-full justify-center">
          <Badge
            className={cn(
              'gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150',
              isOpen && 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
              isPending && 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
              !isOpen && !isPending && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            )}
          >
            {isOpen ? (
              <>
                <AlertTriangle className="size-3" />
                Por corregir
              </>
            ) : isPending ? (
              <>
                <ShieldCheck className="size-3" />
                En re-inspección
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3" />
                Resuelto
              </>
            )}
          </Badge>
        </div>
      )
    },
  },

  {
    id: 'actions',
    size: 150,

    header: () => (
      <div className="flex w-full justify-center text-xs font-medium text-muted-foreground">
        Acciones
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex w-full justify-center" onClick={(e) => e.stopPropagation()}>
        <ResolveAction record={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
