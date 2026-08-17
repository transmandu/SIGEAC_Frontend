"use client"

import QuarantineArticleDropdownActions from "@/components/dropdowns/mantenimiento/control_calidad/QuarantineArticleDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatQuarantineDate, quarantineRisk } from "@/lib/warehouse/quarantine"
import type { QuarantineRecord } from "@/types/quarantine"
import { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Repeat2,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react"

function riskBadge(state: ReturnType<typeof quarantineRisk>["state"]) {
  if (state === "expired") return { variant: "destructive" as const, label: "VENCIDO" }
  if (state === "warning") return { variant: "secondary" as const, label: "POR VENCER" }
  if (state === "ok") return { variant: "outline" as const, label: "EN PLAZO" }
  return { variant: "outline" as const, label: "SIN FECHA" }
}

export const getColumns = (legalDays: number): ColumnDef<QuarantineRecord>[] => [
  {
    accessorKey: "article.batch.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="space-y-0.5 text-center">
        <p className="font-semibold leading-tight">
          {row.original.article?.batch?.name ?? "-"}
        </p>
      </div>
    ),
  },

  {
    accessorKey: "article.part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parte / Alternativos" />
    ),
    meta: { title: "Parte / Alternativos" },
    cell: ({ row }) => {
      const article = row.original.article
      const pn = article?.part_number ?? "-"
      const alt = article?.alternative_part_number

      // El endpoint del ciclo puede devolverlo como arreglo o como texto según
      // cómo se cargó el artículo; ambos casos deben renderizar igual.
      const alternatives = Array.isArray(alt)
        ? alt
        : alt
          ? String(alt).split(",").map((value) => value.trim()).filter(Boolean)
          : []

      return (
        <div className="flex flex-col items-center gap-1">
          <p className="font-semibold">{pn}</p>

          {alternatives.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1">
              {alternatives.slice(0, 2).map((value) => (
                <Badge key={value} variant="secondary" className="rounded-full text-xs">
                  {value}
                </Badge>
              ))}
              {alternatives.length > 2 && (
                <Badge variant="outline" className="rounded-full text-xs">
                  +{alternatives.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">Sin alternativos</p>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: "article.serial",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nro. Serie/Lote" />,
    meta: { title: "Nro. Serie/Lote" },
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.article?.serial ?? "-"}</p>
    ),
  },

  {
    accessorKey: "article.ata_code",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="ATA" />,
    meta: { title: "ATA" },
    cell: ({ row }) => (
      <p className="text-center">{row.original.article?.ata_code ?? "-"}</p>
    ),
  },

  {
    id: "quarantine_info",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuarentena" />,
    meta: { title: "Cuarentena" },
    cell: ({ row }) => {
      const record = row.original
      const attempts = record.cycles?.length ?? 0

      return (
        <div className="space-y-1">
          <p className="max-w-[220px] text-sm font-medium">{record.reason}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {record.inspector ?? "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatQuarantineDate(record.quarantine_entry_date)}
            </span>
            {attempts > 1 && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Repeat2 className="h-3.5 w-3.5" />
                {attempts} intentos
              </span>
            )}
          </div>
        </div>
      )
    },
  },

  {
    id: "correction",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Corrección de compras" />,
    meta: { title: "Corrección de compras" },
    cell: ({ row }) => {
      const record = row.original

      if (!record.resolution_notes) {
        return (
          <p className="text-center text-xs italic text-muted-foreground">
            Sin corregir todavía
          </p>
        )
      }

      return (
        <div className="space-y-1">
          <p className="max-w-[220px] text-sm">{record.resolution_notes}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" />
              {record.resolved_by ?? "—"}
            </span>
          </div>
        </div>
      )
    },
  },

  {
    id: "legal_window",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plazo legal" />,
    meta: { title: "Plazo legal" },

    // Ordenable por urgencia: vencidos primero.
    accessorFn: (row) => {
      const risk = quarantineRisk(row.quarantine_entry_date, legalDays, row.days_in_quarantine)
      if (risk.days === null) return -1
      return risk.state === "expired" ? 1000 + risk.days : risk.days
    },

    cell: ({ row }) => {
      const record = row.original
      const risk = quarantineRisk(record.quarantine_entry_date, legalDays, record.days_in_quarantine)
      const badge = riskBadge(risk.state)

      if (risk.days === null) {
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge variant={badge.variant} className="rounded-full">
              {badge.label}
            </Badge>
            <p className="text-xs text-muted-foreground">—</p>
          </div>
        )
      }

      return (
        <div className="flex flex-col items-center gap-1">
          <Badge variant={badge.variant} className="rounded-full">
            {badge.label}
          </Badge>

          <p className="text-sm font-semibold tabular-nums">
            {risk.days} / {legalDays}
          </p>

          <p className="text-xs tabular-nums text-muted-foreground">
            {(risk.remaining ?? 0) >= 0
              ? `Restan ${risk.remaining} días`
              : `Vencido por ${Math.abs(risk.remaining ?? 0)} días`}
          </p>
        </div>
      )
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const status = row.original.status

      const isOpen = status === "OPEN"
      const isPending = status === "PENDING_REINSPECTION"

      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "select-none gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm",
              isOpen && "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
              isPending && "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
              !isOpen && !isPending &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {isOpen ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                EN CUARENTENA
              </>
            ) : isPending ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                LISTO PARA RE-INSPECCIÓN
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                RESUELTO
              </>
            )}
          </Badge>
        </div>
      )
    },
  },

  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acciones" />,
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <QuarantineArticleDropdownActions record={row.original} />
      </div>
    ),
    enableSorting: false,
  },
]
