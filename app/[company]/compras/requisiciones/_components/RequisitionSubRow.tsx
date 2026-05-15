'use client'

import { CalendarDays, CheckCircle2, Clock3, FileText, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Requisition } from '@/types'
import Link from 'next/link'
import { useCompanyStore } from '@/stores/CompanyStore'

interface Props {
  requisition: Requisition
  selectedCompany: { slug: string } | null
}

export default function RequisitionSubRow({
  requisition,
}: Props) {

  const { selectedCompany } = useCompanyStore()
  const quotes = requisition.quotes ?? []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Cotizaciones asociadas
          </span>
          <span className="text-xs text-muted-foreground">
            Requisición {requisition.order_number}
          </span>
        </div>
        <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-background/60">
          {quotes.length} {quotes.length === 1 ? 'cotización' : 'cotizaciones'}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        {quotes.map((quote) => {
          const approved = quote.status === 'APROBADO'
          const rejected = quote.status === 'RECHAZADO'
          const pending = quote.status === 'PENDIENTE'
          const vendorName = quote.vendor?.name ?? '—'
          const decisionDate = quote.updated_at
            ? new Date(quote.updated_at).toISOString().slice(0, 10)
            : null
          return (
            <div
              key={quote.quote_number}
              className="group flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-background/70 backdrop-blur-sm border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-400/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all"
            >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                 <FileText className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex flex-col leading-tight">
                <Link
                    href={`/${selectedCompany?.slug}/compras/cotizaciones/${quote.quote_number}`}
                    className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {quote.quote_number}
                  </Link>
                  <span className="text-[11px] text-muted-foreground">
                    {vendorName}
                  </span>
              </div>
            </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>
                    {decisionDate ?? 'Sin decisión'}
                  </span>
                </div>
                <Badge
                  className={cn(
                    `rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default`,

                    approved && `border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200`,

                    rejected && `border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200`,

                    pending && `border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200`
                  )}
                >
                  <div className="flex items-center gap-1">
                    {approved && <CheckCircle2 className="h-3 w-3" />}
                    {rejected && <XCircle className="h-3 w-3" />}
                    {pending && <Clock3 className="h-3 w-3" />}
                    {quote.status}
                  </div>
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}