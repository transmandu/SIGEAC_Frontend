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
import type { TransitStatusFilter } from '../types'

type Props = {
  search: string
  setSearch: (value: string) => void
  status: TransitStatusFilter
  setStatus: (value: TransitStatusFilter) => void
  placeholder?: string
}

const TransitToolBar = ({
  search,
  setSearch,
  status,
  setStatus,
  placeholder = 'Buscar artículos, batch o ubicación...',
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
          onValueChange={(value) =>
            setStatus(value as TransitStatusFilter)
          }
        >
          <SelectTrigger
            className="
              h-8 w-[200px]
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

            <SelectItem value="TRANSIT">
              En tránsito
            </SelectItem>

            <SelectItem value="RECEPTION">
              En recepción
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  )
}

export default TransitToolBar