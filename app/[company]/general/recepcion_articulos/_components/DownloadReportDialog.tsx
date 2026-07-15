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
import { CalendarIcon, Download, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateFrom && !dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dateFrom && dateTo ? (
                    <>
                      {format(dateFrom, 'dd/MM/yyyy')} — {format(dateTo, 'dd/MM/yyyy')}
                    </>
                  ) : dateFrom ? (
                    <>Desde: {format(dateFrom, 'dd/MM/yyyy')}</>
                  ) : (
                    'Seleccionar rango de fechas'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateFrom, to: dateTo }}
                  onSelect={(range) => {
                    setDateFrom(range?.from)
                    setDateTo(range?.to)
                  }}
                  numberOfMonths={2}
                  locale={es}
                  initialFocus
                />
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
