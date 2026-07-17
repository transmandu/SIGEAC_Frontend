'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/tables/DataTableHeader'
import axiosInstance from '@/lib/axios'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Building2, FileText, Handshake, Loader2, User, UserCog, Warehouse } from 'lucide-react'
import type { GeneralArticleIntake } from '@/types/purchase'

// Destino del intake, derivado de cuál referencia venga poblada (excluyentes
// entre sí): almacén para el flujo normal, o la entidad de una entrega directa.
const getDestination = (intake: GeneralArticleIntake) => {
  if (intake.warehouse) {
    return { label: intake.warehouse.name, type: 'Almacén', Icon: Warehouse }
  }
  if (intake.department) {
    return { label: intake.department.name, type: 'Departamento', Icon: Building2 }
  }
  if (intake.employee) {
    return {
      label: `${intake.employee.first_name} ${intake.employee.last_name}`,
      type: 'Empleado',
      Icon: User,
    }
  }
  if (intake.authorized_employee) {
    return { label: intake.authorized_employee.full_name, type: 'Solicitante autorizado', Icon: UserCog }
  }
  if (intake.third_party) {
    return { label: intake.third_party.name, type: 'Tercero', Icon: Handshake }
  }
  return null
}

// Botón azul de la Nota de Entrega: comprobante de una entrega directa (el
// intake nunca pasó por almacén, así que este PDF es su único soporte).
const DeliveryNoteButton = ({ intake }: { intake: GeneralArticleIntake }) => {
  const { selectedCompany } = useCompanyStore()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!selectedCompany?.slug || downloading) return
    setDownloading(true)

    try {
      const res = await axiosInstance.get(
        `/${selectedCompany.slug}/general-article-intakes/${intake.id}/delivery-note-pdf`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `nota_entrega_${intake.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // silent
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={downloading}
          className="
            size-8 rounded-lg
            border-blue-500/30 bg-blue-500/10 text-blue-700
            hover:bg-blue-500/20 hover:text-blue-800
            dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300
            dark:hover:bg-blue-400/20 dark:hover:text-blue-200
          "
        >
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Descargar Nota de Entrega</TooltipContent>
    </Tooltip>
  )
}

export const getColumns = (): ColumnDef<GeneralArticleIntake>[] => [

  {
    accessorKey: 'description',
    size: 300,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Artículo" />
      </div>
    ),

    cell: ({ row }) => {
      const { description, brand_model, variant_type } = row.original

      return (
        <div className="flex w-full justify-start">
          <div className="space-y-1 min-w-0">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {description}
            </span>

            {(brand_model || variant_type) && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {brand_model && <span>{brand_model}</span>}
                {brand_model && variant_type && <span>·</span>}
                {variant_type && <span>{variant_type}</span>}
              </div>
            )}
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: 'quantity',
    size: 140,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cantidad" />
      </div>
    ),

    cell: ({ row }) => {
      const { quantity, unit } = row.original

      return (
        <div className="flex justify-center w-full">
          <span className="text-sm font-semibold tabular-nums">
            {quantity}
            {unit?.label && (
              <span className="ml-1 font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/40">
                {unit.label}
              </span>
            )}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'purchase_order',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Solicitud de Compra" />
      </div>
    ),

    cell: ({ row }) => {
      const orderNumber = row.original.purchase_order?.quote_order?.requisition_order?.order_number

      return (
        <div className="flex justify-center w-full">
          <span className="text-xs text-muted-foreground">
            {orderNumber ?? '—'}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'arrived_at',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Llegada" />
      </div>
    ),

    cell: ({ row }) => {
      const { arrived_at } = row.original

      return (
        <div className="flex justify-center w-full">
          <span className="text-xs text-muted-foreground">
            {arrived_at ? format(new Date(arrived_at), 'dd/MM/yyyy HH:mm') : '—'}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'registered_by',
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Entregado por" />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-xs text-muted-foreground uppercase">
          {row.original.registered_by}
        </span>
      </div>
    ),
  },

  {
    accessorKey: 'status',
    size: 160,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    cell: ({ row }) => {
      const { status } = row.original
      const isPending = status === 'PENDING'
      const isRejected = status === 'REJECTED'
      const isDelivered = status === 'DELIVERED'

      return (
        <div className="flex justify-center w-full">
          <Badge
            variant="outline"
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default uppercase',
              isPending
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15'
                : isRejected
                  ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15'
                  : isDelivered
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
            )}
          >
            {isPending ? 'Pendiente' : isRejected ? 'Rechazada' : isDelivered ? 'Entregada' : 'Confirmada'}
          </Badge>
        </div>
      )
    },
  },

  {
    accessorKey: 'confirmed_by',
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Confirmación" />
      </div>
    ),

    cell: ({ row }) => {
      const { status, confirmed_by, confirmed_at, rejected_by, rejected_at, rejection_reason } = row.original

      if (status === 'DELIVERED') {
        const destination = getDestination(row.original)

        return (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full">
            <span className="text-[11px] text-muted-foreground text-center leading-snug">
              Entrega directa
              <br />
              <span className="text-muted-foreground/70">{destination?.label ?? 'Sin paso por almacén'}</span>
            </span>
            <DeliveryNoteButton intake={row.original} />
          </div>
        )
      }

      if (status === 'PENDING') {
        return (
          <div className="flex justify-center w-full">
            <span className="text-muted-foreground/40 text-xs">—</span>
          </div>
        )
      }

      if (status === 'REJECTED') {
        return (
          <div className="flex justify-center w-full">
            <span className="text-[11px] text-muted-foreground text-center leading-snug">
              Rechazado por:
              <br />
              <span className="uppercase font-medium">{rejected_by}</span>
              {rejected_at && (
                <>
                  <br />
                  El {format(new Date(rejected_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </>
              )}
              {rejection_reason && (
                <>
                  <br />
                  <span className="italic text-red-600/80 dark:text-red-400/80">
                    “{rejection_reason}”
                  </span>
                </>
              )}
            </span>
          </div>
        )
      }

      return (
        <div className="flex justify-center w-full">
          <span className="text-[11px] text-muted-foreground text-center leading-snug">
            Confirmado por:
            <br />
            <span className="uppercase font-medium">{confirmed_by}</span>
            {confirmed_at && (
              <>
                <br />
                El {format(new Date(confirmed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </>
            )}
          </span>
        </div>
      )
    },
  },
]
