'use client'

import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Search,
  SlidersHorizontal,
} from 'lucide-react'

type Props = {
  search: string
  setSearch: (value: string) => void
  status: string
  setStatus: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
  placeholder?: string
}

const QuotesToolBar = ({
  search,
  setSearch,
  status,
  setStatus,
  groupBy,
  setGroupBy,
  placeholder = 'Buscar cotizaciones...',
}: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2">

      <div className="relative w-64 sm:w-72">
        <Search
          className="
            absolute left-2.5 top-1/2
            -translate-y-1/2
            size-3.5
            text-muted-foreground
          "
        />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="
            pl-8 h-8 text-xs

            bg-white/80 dark:bg-slate-900/60

            border-slate-200/60
            dark:border-slate-700/60

            focus-visible:ring-1
            focus-visible:ring-[#439A97]/40
          "
        />
      </div>

      <div className="relative">
        <SlidersHorizontal
          className="
            pointer-events-none
            absolute left-2.5 top-1/2
            -translate-y-1/2
            z-10
            size-3.5
            text-muted-foreground
          "
        />

        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger
            className="
              h-8 w-[180px]
              pl-8
              text-xs

              bg-white/80 dark:bg-slate-900/60

              border-slate-200/60
              dark:border-slate-700/60

              transition-colors

              focus:ring-1
              focus:ring-[#439A97]/40

              data-[placeholder]:text-muted-foreground
            "
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent
            className="
              border-slate-200/60
              dark:border-slate-700/60
            "
          >
            <SelectItem value="ALL">
              Todos los estados
            </SelectItem>

            <SelectItem value="PENDIENTE">
              Pendiente
            </SelectItem>

            <SelectItem value="APROBADO">
              Aprobado
            </SelectItem>

            <SelectItem value="RECHAZADA">
              Rechazada
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* GROUP FILTER */}
      <div className="relative">
        <SlidersHorizontal
          className="
            pointer-events-none
            absolute left-2.5 top-1/2
            -translate-y-1/2
            z-10
            size-3.5
            text-muted-foreground
          "
        />

        <Select
          value={groupBy}
          onValueChange={setGroupBy}
        >
          <SelectTrigger
            className="
              h-8 w-[220px]
              pl-8
              text-xs

              bg-white/80 dark:bg-slate-900/60

              border-slate-200/60
              dark:border-slate-700/60

              transition-colors

              focus:ring-1
              focus:ring-[#439A97]/40

              data-[placeholder]:text-muted-foreground
            "
          >
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>

          <SelectContent
            className="
              border-slate-200/60
              dark:border-slate-700/60
            "
          >
            <SelectItem value="NONE">
              Sin agrupación
            </SelectItem>

            <SelectItem value="requisition_order">
              Solicitud de Compra
            </SelectItem>

            <SelectItem value="vendor">
              Proveedor
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}

export default QuotesToolBar