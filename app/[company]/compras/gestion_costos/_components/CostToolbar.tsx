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

type CostType = 'ARTICLE' | 'GENERAL'

type Props = {
  search: string
  setSearch: (value: string) => void

  groupBy: string
  setGroupBy: (value: string) => void

  type: CostType

  placeholder?: string
}

const CostToolbar = ({
  search,
  setSearch,

  groupBy,
  setGroupBy,

  type,

  placeholder = 'Buscar artículo o general...',
}: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* SEARCH */}
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

    </div>
  )
}

export default CostToolbar