'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, FileDown, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useDownloadRequisitionsByStatusPdf } from '@/hooks/mantenimiento/compras/useDownloadRequisitionsByStatusPdf'

/**
 * Estados ofrecidos. Se omiten APROBADA y NO APROBADA a propósito: son
 * solicitudes cerradas y el reporte sigue lo que todavía está en curso.
 * Debe coincidir con REPORTABLE_STATUSES del backend.
 */
const STATUS_OPTIONS = [
  {
    value: 'CREATED',
    label: 'Creada',
    description: 'Registrada, aún sin pasar por compras.',
    cls: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',
  },
  {
    value: 'RECEIVED',
    label: 'Recibida',
    description: 'Compras ya la tomó para gestionarla.',
    cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
  },
  {
    value: 'IN_PROGRESS',
    label: 'En Proceso',
    description: 'En gestión de cotización.',
    cls: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-200',
  },
  {
    value: 'QUOTED',
    label: 'Cotizada',
    description: 'Con cotización cargada, a la espera de aprobación.',
    cls: 'bg-amber-600/20 text-amber-800 dark:text-amber-200',
  },
] as const

/**
 * Tipado mínimo de la File System Access API (showSaveFilePicker),
 * disponible solo en navegadores Chromium; aún no forma parte de lib.dom.
 */
interface PdfWritableStream {
  write(data: Blob): Promise<void>
  close(): Promise<void>
}

interface PdfFileHandle {
  createWritable(): Promise<PdfWritableStream>
}

type SaveFilePicker = (options?: {
  suggestedName?: string
  types?: { description?: string; accept: Record<string, string[]> }[]
}) => Promise<PdfFileHandle>

/**
 * Descarga el reporte "Solicitudes de Compra por Estado": se eligen los estados
 * a incluir y el PDF lista cada solicitud en una línea con sus artículos, cada
 * uno con su etapa en el ciclo de compra (si ya se pagó y si ya se recibió).
 */
export function DownloadRequisitionsByStatusDialog() {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(() =>
    STATUS_OPTIONS.map((option) => option.value)
  )

  const { mutateAsync: downloadPdf, isPending } =
    useDownloadRequisitionsByStatusPdf()

  const toggleStatus = (value: string) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((status) => status !== value)
        : [...current, value]
    )
  }

  const allSelected = selected.length === STATUS_OPTIONS.length

  const handleDownload = async () => {
    if (!selectedCompany?.slug || selected.length === 0) return

    // El endpoint lleva la estación en la ruta. Se resetea al cambiar de
    // compañía, así que puede faltar sin que el usuario lo note: sin avisar,
    // el botón simplemente no hacía nada.
    if (!selectedStation) {
      toast.error('Seleccione una estación para generar el reporte.')
      return
    }

    const fileName = `solicitudes-por-estado-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}.pdf`

    try {
      // El PDF se pide ANTES de abrir el selector de destino: showSaveFilePicker
      // crea el archivo en disco apenas se elige la ruta, así que preguntar
      // primero dejaba un .pdf de 0 bytes cuando el backend respondía error.
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        locationId: selectedStation,
        statuses: selected,
      })

      let fileHandle: PdfFileHandle | null = null

      const showSaveFilePicker = (
        window as Window & { showSaveFilePicker?: SaveFilePicker }
      ).showSaveFilePicker

      if (showSaveFilePicker) {
        try {
          fileHandle = await showSaveFilePicker({
            suggestedName: fileName,
            types: [
              { description: 'Documento PDF', accept: { 'application/pdf': ['.pdf'] } },
            ],
          })
        } catch (error) {
          // Cerró el diálogo sin elegir destino: no hay nada que hacer
          if ((error as DOMException)?.name === 'AbortError') return

          // Falló por otra razón: continuar con la descarga clásica
          fileHandle = null
        }
      }

      if (fileHandle) {
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = fileName
        // El ancla debe estar en el documento: Firefox ignora el click sobre un
        // elemento suelto y la descarga no ocurría.
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        URL.revokeObjectURL(url)
      }

      toast.success('Reporte de solicitudes generado')
      setOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo generar el reporte de solicitudes por estado.'
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Al abrir se vuelve a todos: es el caso normal, y así una descarga
        // acotada anterior no condiciona la siguiente en silencio.
        if (next) setSelected(STATUS_OPTIONS.map((option) => option.value))
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border-border px-3 text-xs font-medium"
        >
          <FileDown className="h-3.5 w-3.5" />
          Descargar por Estado
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Descargar Solicitudes por Estado</DialogTitle>
          <DialogDescription>
            Seleccione los estados a incluir. El reporte lista los artículos de
            cada solicitud con su ciclo de compra.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs text-muted-foreground">
            {selected.length === 0
              ? 'Ningún estado seleccionado'
              : `${selected.length} de ${STATUS_OPTIONS.length} seleccionados`}
          </span>

          <button
            type="button"
            onClick={() =>
              setSelected(
                allSelected ? [] : STATUS_OPTIONS.map((option) => option.value)
              )
            }
            className="text-xs font-medium text-primary hover:underline"
          >
            {allSelected ? 'Limpiar' : 'Seleccionar todos'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value)

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStatus(option.value)}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                  isSelected
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>

                <span className="flex flex-col leading-tight">
                  <span
                    className={cn(
                      'w-fit rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                      option.cls
                    )}
                  >
                    {option.label.toUpperCase()}
                  </span>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          {selected.length > 0 && (
            <Button onClick={handleDownload} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar PDF
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
  </Dialog>
  )
}
