"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, ShieldAlert, User } from "lucide-react"
import IncomingArticleDropdownActions from "@/components/dropdowns/mantenimiento/control_calidad/IncomingArticleDropdownActions"
import { QuarantineArticle } from "./types"

const LEGAL_LIMIT_DAYS = 40

function parseYMD(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function daysSince(dateStr: string) {
  const start = parseYMD(dateStr)
  const now = new Date()
  const diff = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function formatDateES(dateStr?: string | null) {
  if (!dateStr) return "-"
  const dt = parseYMD(dateStr)
  return dt.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type RiskState = "ok" | "warning" | "expired" | "unknown"

function quarantineRisk(entryDate?: string | null) {
  if (!entryDate) {
    return { days: null as number | null, remaining: null as number | null, state: "unknown" as RiskState }
  }

  const days = daysSince(entryDate)
  const remaining = LEGAL_LIMIT_DAYS - days

  if (days >= LEGAL_LIMIT_DAYS) return { days, remaining, state: "expired" as RiskState }
  if (days >= 30) return { days, remaining, state: "warning" as RiskState }
  return { days, remaining, state: "ok" as RiskState }
}

function riskBadge(state: RiskState) {
  if (state === "expired") return { variant: "destructive" as const, label: "Vencido" }
  if (state === "warning") return { variant: "secondary" as const, label: "Por vencer" }
  if (state === "ok") return { variant: "outline" as const, label: "En plazo" }
  return { variant: "outline" as const, label: "Sin fecha" }
}

function statusBadge(status?: string) {
  const s = (status ?? "").toLowerCase()
  if (s === "quarantine") return { label: "Cuarentena", variant: "destructive" as const }
  return { label: status ?? "-", variant: "secondary" as const }
}

export const columns: ColumnDef<QuarantineArticle>[] = [
  {
    accessorKey: "batch.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    meta: { title: "Descripción" },
    cell: ({ row }) => {
      const batchName = row.original.batch?.name ?? "-"
      return (
        <div className="space-y-0.5 text-center">
          <p className="font-semibold leading-tight">{batchName}</p>
        </div>
      )
    },
  },

  {
    accessorKey: "part_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parte / Alternativos" />,
    meta: { title: "Parte / Alternativos" },
    cell: ({ row }) => {
      const pn = row.original.part_number ?? "-"
      const alt = row.original.alternative_part_number ?? []

      return (
        <div className="flex flex-col items-center gap-1">
          <p className="font-semibold">{pn}</p>

          {alt.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1">
              {alt.slice(0, 2).map((a) => (
                <Badge key={a} variant="secondary" className="rounded-full text-xs">
                  {a}
                </Badge>
              ))}
              {alt.length > 2 ? (
                <Badge variant="outline" className="rounded-full text-xs">
                  +{alt.length - 2}
                </Badge>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Sin alternativos</p>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: "serial",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nro. Serie/Lote" />,
    meta: { title: "Nro. Serie/Lote" },
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.serial ?? "-"}</p>
    ),
  },

  {
    accessorKey: "ata_code",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="ATA" />,
    meta: { title: "ATA" },
    cell: ({ row }) => <p className="text-center">{row.original.ata_code ?? "-"}</p>,
  },

  {
    id: "quarantine_info",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuarentena" />,
    meta: { title: "Cuarentena" },
    cell: ({ row }) => {
      const q = row.original.quarantine?.[0]
      const reason = q?.reason ?? "—"
      const inspector = q?.inspector ?? "—"
      const entry = q?.quarantine_entry_date ?? null

      return (
        <div className="space-y-1">
          <p className="max-w-[220px] text-sm font-medium">{reason}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {inspector}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateES(entry)}
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

    // Ordenable por urgencia: vencidos primero
    accessorFn: (row) => {
      const entry = row.quarantine?.[0]?.quarantine_entry_date
      const r = quarantineRisk(entry)
      if (r.days === null) return -1
      if (r.state === "expired") return 1000 + r.days
      return r.days
    },

    cell: ({ row }) => {
      const entry = row.original.quarantine?.[0]?.quarantine_entry_date
      const r = quarantineRisk(entry)
      const b = riskBadge(r.state)

      if (r.days === null) {
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge variant={b.variant} className="rounded-full">{b.label}</Badge>
            <p className="text-xs text-muted-foreground">—</p>
          </div>
        )
      }

      const absRemaining = Math.abs(r.remaining ?? 0)

      return (
        <div className="flex flex-col items-center gap-1">
          <Badge variant={b.variant} className="rounded-full">
            {b.label}
          </Badge>

          <p className="text-sm font-semibold tabular-nums">
            {r.days} / {LEGAL_LIMIT_DAYS}
          </p>

          <p className="text-xs text-muted-foreground tabular-nums">
            {r.remaining! >= 0 ? `Restan ${r.remaining} días` : `Vencido por ${absRemaining} días`}
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
      const cfg = statusBadge(row.original.status)
      return (
        <div className="flex justify-center">
          <Badge variant={cfg.variant} className="rounded-full gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            {cfg.label}
          </Badge>
        </div>
      )
    },
  },

  {
    accessorKey: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acciones" />,
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <IncomingArticleDropdownActions article={row.original as any} />
      </div>
    ),
  },
]
