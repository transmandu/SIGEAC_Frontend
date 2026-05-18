'use client'

import { Mail, Phone } from 'lucide-react'
import { ShippingAgency } from '@/types'

interface Props {
  agency: ShippingAgency
}

export default function ShippingAgenciesSubRow({ agency }: Props) {
  const hasInfo = agency.phone || agency.email

  if (!hasInfo) {
    return (
      <div className="px-4 py-2">
        <div className="text-[11px] text-muted-foreground/60 italic">
          Sin información adicional
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2 space-y-2">

      <div className="flex flex-col">
        <span className="text-s font-semibold text-slate-800 dark:text-slate-100">
          Información de contacto
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">

        <div className="rounded-md border border-slate-200/60 dark:border-slate-700/50 bg-slate-50/40 dark:bg-slate-900/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
            Teléfono
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
            <Phone className="size-3 opacity-60 shrink-0" />
            <span className="tabular-nums">
              {agency.phone ?? '—'}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-slate-200/60 dark:border-slate-700/50 bg-slate-50/40 dark:bg-slate-900/30 px-3 py-2">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
            Correo
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 break-all">
            <Mail className="size-3 opacity-60 shrink-0" />
            <span>
              {agency.email ?? '—'}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}