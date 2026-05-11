'use client'

import {
  Boxes,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type Props = {
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
}

const GroupRow = ({
  title,
  count,
  expanded,
  onToggle,
}: Props) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        `
          flex w-full items-center justify-between
          gap-4

          px-4 py-3

          transition-colors

          border-b

          bg-slate-50/80
          dark:bg-slate-800/60

          border-slate-200/70
          dark:border-slate-700/50

          hover:bg-slate-100/70
          dark:hover:bg-slate-800
        `,
        !expanded && 'border-b-0'
      )}
    >

      <div className="flex items-center gap-3 min-w-0">

        <div
          className="
            flex items-center justify-center
            size-8 rounded-lg

            bg-white/80
            dark:bg-slate-900/70

            border border-slate-200
            dark:border-slate-700/60

            shrink-0
          "
        >
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </div>

        <div
          className="
            flex items-center justify-center
            size-8 rounded-lg

            bg-emerald-500/10
            border border-emerald-500/20

            shrink-0
          "
        >
          <Boxes
            className="
              size-4
              text-emerald-600
              dark:text-emerald-400
            "
          />
        </div>

        <div className="flex flex-col items-start min-w-0">

          <span
            className="
              text-xs uppercase tracking-wide
              text-muted-foreground
            "
          >
            Grupo
          </span>

          <span
            className="
              text-sm font-semibold
              text-foreground

              truncate max-w-[500px]
            "
          >
            {title}
          </span>
        </div>
      </div>

      <div
        className="
          shrink-0

          rounded-full
          border

          border-slate-200
          dark:border-slate-700/60

          bg-white/80
          dark:bg-slate-900/60

          px-3 py-1

          text-xs font-medium
          text-muted-foreground

          tabular-nums
        "
      >
        {count} {count === 1 ? 'artículo' : 'artículos'}
      </div>
    </button>
  )
}

export default GroupRow