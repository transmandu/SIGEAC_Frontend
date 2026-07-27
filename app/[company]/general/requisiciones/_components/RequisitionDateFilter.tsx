'use client'

import { Column } from '@tanstack/react-table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowDownIcon, ArrowUpIcon, CalendarDays, CalendarX } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Requisition } from '@/types/purchase'

/** yyyy-MM-dd en hora local: toISOString() correría la fecha un día. */
export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const fromISODate = (value?: string) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Ambos extremos opcionales; una fecha única se guarda como from === to. */
export interface DateFilterValue {
  from?: string
  to?: string
}

interface Props {
  column: Column<Requisition, unknown>
  title: string
}

export default function RequisitionDateFilter({ column, title }: Props) {
  const value = (column.getFilterValue() as DateFilterValue) ?? {}
  const from = fromISODate(value.from)
  const to = fromISODate(value.to)

  const [calendarMonth, setCalendarMonth] = useState<Date>(from ?? new Date())

  const sorted = column.getIsSorted()
  const hasFilter = !!from || !!to

  const applyRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      column.setFilterValue(undefined)
      return
    }

    // Sin `to` el usuario aún está a medio rango: se toma como fecha única.
    const end = range.to ?? range.from

    column.setFilterValue({
      from: toISODate(range.from),
      to: toISODate(end),
    })
    setCalendarMonth(range.from)
  }

  const applyPreset = (start: Date, end: Date) => {
    column.setFilterValue({ from: toISODate(start), to: toISODate(end) })
    setCalendarMonth(start)
  }

  const label = () => {
    if (!from) return 'Filtrar por fecha'
    if (!to || from.getTime() === to.getTime()) {
      return format(from, 'dd MMM yyyy', { locale: es })
    }
    return `${format(from, 'dd MMM', { locale: es })} — ${format(to, 'dd MMM yyyy', { locale: es })}`
  }

  return (
    <div className="flex items-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 gap-1.5 px-2 data-[state=open]:bg-accent',
              hasFilter && 'text-foreground',
            )}
          >
            <span className="truncate">{title}</span>
            <CalendarDays
              className={cn(
                'h-3.5 w-3.5',
                hasFilter ? 'text-foreground' : 'opacity-70',
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          side="bottom"
          sideOffset={8}
          className="w-auto rounded-xl p-3"
        >
          <div className="mb-2 flex items-center justify-center gap-1">
            {[
              {
                label: '7D',
                tooltip: 'Últimos 7 días',
                fn: () => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(end.getDate() - 6)
                  applyPreset(start, end)
                },
              },
              {
                label: '30D',
                tooltip: 'Últimos 30 días',
                fn: () => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(end.getDate() - 29)
                  applyPreset(start, end)
                },
              },
              {
                label: 'MES',
                tooltip: 'Mes actual',
                fn: () => {
                  const today = new Date()
                  applyPreset(
                    new Date(today.getFullYear(), today.getMonth(), 1),
                    today,
                  )
                },
              },
            ].map((preset) => (
              <TooltipProvider key={preset.label} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={preset.fn}
                    >
                      {preset.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs" sideOffset={6}>
                    {preset.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    disabled={!hasFilter}
                    onClick={() => column.setFilterValue(undefined)}
                  >
                    <CalendarX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs" sideOffset={6}>
                  Limpiar fecha
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Calendar
            mode="range"
            selected={{ from, to }}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            onSelect={applyRange}
          />

          <p className="mt-1 text-center text-[11px] text-muted-foreground">
            {hasFilter ? label() : 'Elige un día o arrastra para un rango.'}
          </p>

          {column.getCanSort() ? (
            <>
              <div className="my-2 h-px bg-border" />
              <div className="flex items-center justify-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn('h-7 px-2 text-xs', sorted === 'asc' && 'font-bold')}
                  onClick={() => column.toggleSorting(false)}
                >
                  <ArrowUpIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground/70" />
                  Ascendente
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn('h-7 px-2 text-xs', sorted === 'desc' && 'font-bold')}
                  onClick={() => column.toggleSorting(true)}
                >
                  <ArrowDownIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground/70" />
                  Descendente
                </Button>
              </div>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
