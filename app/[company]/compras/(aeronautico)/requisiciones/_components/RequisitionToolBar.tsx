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
  type: string
  setType: (value: string) => void
  priority: string
  setPriority: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
  placeholder?: string
}

const selectTriggerClass = `h-8 w-full pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-[#439A97]/40 data-[placeholder]:text-muted-foreground [&>span]:truncate`
const selectContentClass = `border-slate-200/60 dark:border-slate-700/60`

const GroupFilter = ({
  groupBy,
  setGroupBy,
}: {
  groupBy: string
  setGroupBy: (value: string) => void
}) => (
  <div className="relative sm:w-44 sm:shrink-0">
    <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

    <Select value={groupBy} onValueChange={setGroupBy}>
      <SelectTrigger className={selectTriggerClass}>
        <SelectValue placeholder="Agrupar por" />
      </SelectTrigger>

      <SelectContent className={selectContentClass}>
        <SelectItem value="NONE">
          Sin agrupación
        </SelectItem>

        <SelectItem value="requested_by">
          Solicitante
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
)

const FilterSelects = ({
  status,
  setStatus,
  type,
  setType,
  priority,
  setPriority,
  groupBy,
  setGroupBy,
}: {
  status: string
  setStatus: (value: string) => void
  type: string
  setType: (value: string) => void
  priority: string
  setPriority: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
}) => (
  <>
    {/* STATUS */}
    <div className="relative sm:w-44 sm:shrink-0">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
          <SelectItem value="ALL">Todos los estados</SelectItem>
          <SelectItem value="CREATED">CREADA</SelectItem>
          <SelectItem value="RECEIVED">RECIBIDA</SelectItem>
          <SelectItem value="IN_PROGRESS">EN PROCESO</SelectItem>
          <SelectItem value="QUOTED">COTIZADA</SelectItem>
          <SelectItem value="APPROVED">APROBADA</SelectItem>
          <SelectItem value="REJECTED">RECHAZADA</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* TYPE — oculto: las requisiciones de este módulo siempre son tipo "AERONAUTICAL" */}
    {/* <div className="relative sm:w-44 sm:shrink-0">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
          <SelectItem value="ALL">Todos los tipos</SelectItem>
          <SelectItem value="AERONAUTICAL">Aeronáutico</SelectItem>
        </SelectContent>
      </Select>
    </div> */}

    {/* PRIORITY */}
    <div className="relative sm:w-44 sm:shrink-0">
      <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10 size-3.5 text-muted-foreground"/>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className={selectTriggerClass}>
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>

        <SelectContent className={selectContentClass}>
          <SelectItem value="ALL">Todas las prioridades</SelectItem>
          <SelectItem value="LOW">Baja</SelectItem>
          <SelectItem value="MEDIUM">Media</SelectItem>
          <SelectItem value="HIGH">Alta</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* GROUP BY */}
    <GroupFilter groupBy={groupBy} setGroupBy={setGroupBy} />
  </>
)

const RequisitionToolBar = ({
  search,
  setSearch,
  status,
  setStatus,
  type,
  setType,
  priority,
  setPriority,
  groupBy,
  setGroupBy,
  placeholder = 'Buscar requisiciones...',
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
              type={type}
              setType={setType}
              priority={priority}
              setPriority={setPriority}
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
          type={type}
          setType={setType}
          priority={priority}
          setPriority={setPriority}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
        />
      </div>

    </div>
  )
}

export default RequisitionToolBar