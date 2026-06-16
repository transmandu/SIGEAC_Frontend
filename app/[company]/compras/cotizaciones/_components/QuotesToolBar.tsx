'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, SlidersHorizontal } from 'lucide-react'

type Props = {
  search: string
  setSearch: (value: string) => void
  status: string
  setStatus: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
  placeholder?: string
}

const selectTriggerClass = `h-8 w-full pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-[#439A97]/40 data-[placeholder]:text-muted-foreground`
const selectContentClass = `border-slate-200/60 dark:border-slate-700/60`

const FilterSelects = ({
  status,
  setStatus,
  groupBy,
  setGroupBy,
}: {
  status: string
  setStatus: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
}) => (
  <>
    {/* STATUS FILTER */}
    <div className="relative">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
          <SelectItem value="ALL">
            Todos los estados
          </SelectItem>

          <SelectItem value="PENDIENTE">
            Pendiente
          </SelectItem>

          <SelectItem value="APROBADA">
            Aprobada
          </SelectItem>

          <SelectItem value="RECHAZADA">
            Rechazada
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* GROUP FILTER */}
    <div className="relative">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

      <Select value={groupBy} onValueChange={setGroupBy}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Agrupar por" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
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
  </>
)

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
    <div className="flex items-center gap-2">

      {/* SEARCH */}
      <div className="relative flex-1 sm:flex-none sm:w-72">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"/>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-8 h-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 focus-visible:ring-1 focus-visible:ring-[#439A97]/40"
        />
      </div>

      {/* MOBILE FILTERS */}
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-72 p-3 space-y-3 border-slate-200/60 dark:border-slate-700/60"
          >
            <FilterSelects
              status={status}
              setStatus={setStatus}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* DESKTOP FILTERS */}
      <div className="hidden sm:flex items-center gap-2">
          <FilterSelects
            status={status}
            setStatus={setStatus}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
          />
      </div>

    </div>
  )
}

export default QuotesToolBar