'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ShoppingCart, Pencil, History } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { GeneralArticleCostHistoryEntry } from '@/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  description?: string
  brandModel?: string
  variantType?: string
  history?: GeneralArticleCostHistoryEntry[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return format(new Date(value), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return value
  }
}

const GeneralCostHistorySheet = ({
  open,
  onOpenChange,
  description,
  brandModel,
  variantType,
  history,
}: Props) => {
  const entries = history ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Historial de costos</SheetTitle>
          <SheetDescription>
            {description ?? 'Artículo general'}
            {(brandModel || variantType) && (
              <span className="block text-xs mt-0.5">
                {[brandModel, variantType].filter(Boolean).join(' · ')}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-3">
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay movimientos de costo registrados.
            </p>
          )}

          {entries.map((entry, idx) => {
            const badgeBySource = {
              PURCHASE: { icon: ShoppingCart, label: 'Compra', className: 'bg-[#CBEDD5] text-[#439A97]' },
              MANUAL: { icon: Pencil, label: 'Ajuste manual', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
              SEED: { icon: History, label: 'Costo previo', className: 'bg-slate-200 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300' },
            } as const

            const badge = badgeBySource[entry.source]
            const Icon = badge.icon

            return (
              <div
                key={idx}
                className={cn(
                  'flex flex-col gap-1.5 rounded-lg border p-3',
                  'bg-white/70 dark:bg-slate-900/40',
                  'border-slate-200 dark:border-slate-700/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={cn('gap-1.5 text-[10px] border-0', badge.className)}
                  >
                    <Icon className="h-3 w-3" />
                    {badge.label}
                  </Badge>

                  <span className="flex items-baseline gap-1 text-sm font-semibold tabular-nums text-foreground">
                    ${Number(entry.cost ?? 0).toFixed(2)}
                    {entry.unit_label && (
                      <span className="text-xs font-normal text-muted-foreground">
                        / {entry.unit_label}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(entry.date)}</span>
                  <span>{entry.by ?? '—'}</span>
                </div>

                {entry.source === 'PURCHASE' && entry.quantity != null && (
                  <span className="text-xs text-muted-foreground">
                    Cantidad: {entry.quantity}
                  </span>
                )}

                {entry.source === 'PURCHASE' && entry.purchase_order_number && (
                  <span className="text-xs text-muted-foreground">
                    OC {entry.purchase_order_number}
                    {entry.requisition_order_number
                      ? ` · Req. ${entry.requisition_order_number}`
                      : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default GeneralCostHistorySheet
