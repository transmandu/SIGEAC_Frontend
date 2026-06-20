'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, SlidersHorizontal } from 'lucide-react'

type CostType = 'ARTICLE' | 'GENERAL'

type Props = {
  search: string
  setSearch: (value: string) => void
  groupBy: string
  setGroupBy: (value: string) => void
  type: CostType
  placeholder?: string
}

const selectTriggerClass = `h-8 w-full pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-[#439A97]/40 data-[placeholder]:text-muted-foreground`
const selectContentClass = `border-slate-200/60 dark:border-slate-700/60`

const GroupFilter = ({
  groupBy,
  setGroupBy,
  type,
}: {
  groupBy: string
  setGroupBy: (value: string) => void
  type: CostType
}) => (
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

        {type === 'ARTICLE' ? (
          <>
            <SelectItem value="part_number">
              Part Number
            </SelectItem>

            <SelectItem value="batch_name">
              Descripción
            </SelectItem>

            <SelectItem value="serial">
              Serial / Serie
            </SelectItem>
          </>
        ) : (
          <>
            <SelectItem value="description">
              Descripción
            </SelectItem>

            <SelectItem value="brand_model">
              Modelo / Marca
            </SelectItem>

            <SelectItem value="variant_type">
              Present. / Especif.
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  </div>
)

const CostToolbar = ({
  search,
  setSearch,
  groupBy,
  setGroupBy,
  type,
  placeholder = 'Buscar artículo o general...',
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

      {/* MOBILE FILTER */}
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
            <GroupFilter
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              type={type}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* DESKTOP FILTER */}
      <div className="hidden sm:flex items-center gap-2">
        <GroupFilter
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          type={type}
        />
      </div>

    </div>
  )
}

export default CostToolbar