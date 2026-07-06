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

import axiosInstance from '@/lib/axios'
import { useCompanyStore } from '@/stores/CompanyStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'


export function DownloadReportDialog() {
  const { selectedCompany } = useCompanyStore()
  const [open, setOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!selectedCompany?.slug) return
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('date_from', format(dateFrom, 'yyyy-MM-dd'))
      if (dateTo) params.set('date_to', format(dateTo, 'yyyy-MM-dd'))

      const res = await axiosInstance.get(
        `/${selectedCompany.slug}/articles-reception-pdf`,
        { params, responseType: 'blob' }
      )

      const blob = res.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reporte_articulos.pdf'
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
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Descargar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Descargar Reporte PDF</DialogTitle>
          <DialogDescription>
            Selecciona el rango de fechas de recepción para filtrar los artículos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de Fechas de Recepción</label>
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
