'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QuarantineStatusFilter } from '@/types/quarantine'
import { Search, SlidersHorizontal } from 'lucide-react'

type Props = {
  search: string
  setSearch: (value: string) => void
  status: QuarantineStatusFilter
  setStatus: (value: QuarantineStatusFilter) => void
  placeholder?: string
}

const selectTriggerClass = `h-8 w-full pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40 data-[placeholder]:text-muted-foreground [&>span]:truncate`
const selectContentClass = `border-slate-200/60 dark:border-slate-700/60`

const StatusFilter = ({
  status,
  setStatus,
}: {
  status: QuarantineStatusFilter
  setStatus: (value: QuarantineStatusFilter) => void
}) => (
  <div className="relative sm:w-52 sm:shrink-0">
    <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />

    <Select value={status} onValueChange={(value) => setStatus(value as QuarantineStatusFilter)}>
      <SelectTrigger className={selectTriggerClass}>
        <SelectValue placeholder="Estado" />
      </SelectTrigger>

      <SelectContent className={selectContentClass}>
        <SelectItem value="UNRESOLVED">En el ciclo (sin resolver)</SelectItem>
        <SelectItem value="OPEN">Por corregir</SelectItem>
        <SelectItem value="PENDING_REINSPECTION">Enviados a re-inspección</SelectItem>
        <SelectItem value="RESOLVED">Resueltos</SelectItem>
        <SelectItem value="ALL">Todos</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

const QuarantineToolBar = ({
  search,
  setSearch,
  status,
  setStatus,
  placeholder = 'Buscar por parte, serial, descripción o motivo...',
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      {/* SEARCH */}
      <div className="relative flex-1 sm:w-80 sm:flex-none">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="h-8 border-slate-200/60 bg-white/80 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-primary/40 dark:border-slate-700/60 dark:bg-slate-900/60"
        />
      </div>

      {/* MOBILE FILTER */}
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 border-slate-200/60 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/60"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-72 space-y-3 border-slate-200/60 p-3 dark:border-slate-700/60"
          >
            <StatusFilter status={status} setStatus={setStatus} />
          </PopoverContent>
        </Popover>
      </div>

      {/* DESKTOP FILTER */}
      <div className="hidden items-center gap-2 sm:flex">
        <StatusFilter status={status} setStatus={setStatus} />
      </div>
    </div>
  )
}

export default QuarantineToolBar
