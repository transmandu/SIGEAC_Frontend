'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import axiosInstance from '@/lib/axios'
import { useCompanyStore } from '@/stores/CompanyStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, CalendarX, Download, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
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

type DateFieldOption = {
  value: string
  label: string
}

type StatusOption = {
  value: string
  label: string
}

type DownloadReportDialogProps = {
  /** Endpoint relativo a `/{company}`, ej: 'articles-reception-pdf' o '{location_id}/general-article-intakes-pdf' */
  endpoint: string
  /** Si el endpoint requiere `location_id`, se antepone automáticamente usando selectedStation */
  requiresLocation?: boolean
  title: string
  description: string
  dateRangeLabel: string
  fileNamePrefix: string
  /** Cuando hay más de un campo de fecha posible (ej: llegada vs. confirmación) */
  dateFieldOptions?: DateFieldOption[]
  /** Filtro de estado opcional (ej: Pendiente/Confirmada/Todas) */
  statusOptions?: StatusOption[]
  triggerVariant?: 'outline' | 'default' | 'secondary'
}

export function DownloadReportDialog({
  endpoint,
  requiresLocation = false,
  title,
  description,
  dateRangeLabel,
  fileNamePrefix,
  dateFieldOptions,
  statusOptions,
  triggerVariant = 'outline',
}: DownloadReportDialogProps) {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const [open, setOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [dateField, setDateField] = useState<string | undefined>(dateFieldOptions?.[0]?.value)
  const [status, setStatus] = useState<string>(statusOptions?.[0]?.value ?? 'ALL')
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!selectedCompany?.slug) return
    if (requiresLocation && !selectedStation) return
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('date_from', format(dateFrom, 'yyyy-MM-dd'))
      if (dateTo) params.set('date_to', format(dateTo, 'yyyy-MM-dd'))
      if (dateFieldOptions && dateField) params.set('date_field', dateField)
      if (statusOptions && status !== 'ALL') params.set('status', status)

      const resolvedEndpoint = requiresLocation
        ? endpoint.replace('{location_id}', selectedStation)
        : endpoint

      const res = await axiosInstance.get(
        `/${selectedCompany.slug}/${resolvedEndpoint}`,
        { params, responseType: 'blob' }
      )

      const blob = res.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const datePart =
        dateFrom && dateTo
          ? `_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}`
          : dateFrom
            ? `_desde_${format(dateFrom, 'yyyy-MM-dd')}`
            : dateTo
              ? `_hasta_${format(dateTo, 'yyyy-MM-dd')}`
              : ''

      a.download = `${fileNamePrefix}${datePart}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setOpen(false)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm" className="gap-2">
          <FileText className="size-4" />
          Descargar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {dateFieldOptions && dateFieldOptions.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por</label>
              <Select value={dateField} onValueChange={setDateField}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFieldOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {statusOptions && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">{dateRangeLabel}</label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <div className="flex justify-center w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-center gap-2 h-11 px-4 border border-dashed border-slate-300/60 dark:border-slate-700/40 bg-background/60 backdrop-blur font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    {dateFrom && dateTo ? (
                      dateFrom.getTime() === dateTo.getTime() ? (
                        <span className="text-center whitespace-nowrap">
                          {format(dateFrom, 'dd MMM yyyy', { locale: es })}
                        </span>
                      ) : (
                        <span className="text-center whitespace-nowrap">
                          {format(dateFrom, 'dd MMM yyyy', { locale: es })} —{' '}
                          {format(dateTo, 'dd MMM yyyy', { locale: es })}
                        </span>
                      )
                    ) : (
                      <span className="text-center text-muted-foreground whitespace-nowrap">
                        Seleccionar rango de fechas
                      </span>
                    )}
                  </Button>
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="center"
                side="bottom"
                sideOffset={10}
                className="p-3 w-auto min-w-[320px] rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl backdrop-blur bg-white/90 dark:bg-slate-950/90"
              >
                {/* ================= PRESETS ================= */}
                <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                  {[
                    {
                      label: '7D',
                      tooltip: 'Últimos 7 días',
                      fn: () => {
                        const end = new Date()
                        const start = new Date()
                        start.setDate(end.getDate() - 7)

                        setDateFrom(start)
                        setDateTo(end)
                        setCalendarMonth(start)
                      },
                    },
                    {
                      label: '30D',
                      tooltip: 'Últimos 30 días',
                      fn: () => {
                        const end = new Date()
                        const start = new Date()
                        start.setDate(end.getDate() - 30)

                        setDateFrom(start)
                        setDateTo(end)
                        setCalendarMonth(start)
                      },
                    },
                    {
                      label:
                        calendarMonth.getMonth() === new Date().getMonth() &&
                        calendarMonth.getFullYear() === new Date().getFullYear()
                          ? 'MES'
                          : format(calendarMonth, 'MMM yyyy', { locale: es }).toUpperCase(),
                      tooltip: 'Mes visible en el calendario',
                      fn: () => {
                        const today = new Date()

                        const start = new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          1
                        )

                        const isCurrentMonth =
                          calendarMonth.getMonth() === today.getMonth() &&
                          calendarMonth.getFullYear() === today.getFullYear()

                        const end = isCurrentMonth
                          ? today
                          : new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth() + 1,
                              0
                            )

                        setDateFrom(start)
                        setDateTo(end)
                        setCalendarMonth(start)
                      },
                    },
                  ].map((p) => (
                    <TooltipProvider key={p.label} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 px-2 h-7"
                            onClick={p.fn}
                          >
                            {p.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs" sideOffset={6}>
                          {p.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                          onClick={() => {
                            setDateFrom(undefined)
                            setDateTo(undefined)
                          }}
                        >
                          <CalendarX className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">Limpiar rango</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* ================= CALENDAR ================= */}
                <div className="scale-[0.95] origin-top">
                  <Calendar
                    mode="range"
                    selected={{ from: dateFrom, to: dateTo }}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={(range) => {
                      const from = range?.from
                      const to = range?.to

                      if (!from) {
                        setDateFrom(undefined)
                        setDateTo(undefined)
                        return
                      }

                      if (!to) {
                        setDateFrom(from)
                        setDateTo(from)
                        setCalendarMonth(from)
                        return
                      }

                      setDateFrom(from)
                      setDateTo(to)
                      setCalendarMonth(from)
                    }}
                    numberOfMonths={
                      dateFrom && dateTo
                        ? dateFrom.getMonth() !== dateTo.getMonth() ||
                          dateFrom.getFullYear() !== dateTo.getFullYear()
                          ? 2
                          : 1
                        : 1
                    }
                    showOutsideDays={false}
                    toMonth={new Date()}
                    locale={es}
                    disabled={(d) => d > new Date()}
                    className={cn(
                      'rounded-xl',
                      '[&_.rdp-day_selected]:bg-slate-200',
                      '[&_.rdp-day_selected]:text-slate-900',
                      '[&_.rdp-day_range_middle]:bg-slate-100',
                      '[&_.rdp-day_range_middle]:text-slate-900',
                      '[&_.rdp-day_range_start]:bg-slate-300',
                      '[&_.rdp-day_range_end]:bg-slate-300'
                    )}
                    formatters={{
                      formatMonthCaption: (date) =>
                        format(date, 'MMMM yyyy', { locale: es }).toUpperCase(),
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {loading ? 'Generando...' : 'Descargar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
