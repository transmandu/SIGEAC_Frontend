'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

type Props = {
  search: string
  setSearch: (value: string) => void
  placeholder?: string
}

const UnknownDestinationToolbar = ({
  search,
  setSearch,
  placeholder = 'Buscar por P/N, serial, tipo o descripción...',
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

    </div>
  )
}

export default UnknownDestinationToolbar