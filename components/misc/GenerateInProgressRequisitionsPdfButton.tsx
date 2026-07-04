'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useDownloadInProgressRequisitionsPdf } from '@/hooks/mantenimiento/compras/useDownloadInProgressRequisitionsPdf'

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
 * Botón que genera y descarga el PDF "Listado de Solicitudes en Proceso"
 * (requisiciones GENERALES con estado IN_PROGRESS de la estación actual).
 *
 * Flujo: abre el diálogo nativo "Guardar como" (cuando el navegador lo
 * soporta), luego muestra una barra de carga no interactiva mientras el
 * backend arma el documento y finalmente escribe el archivo en el destino
 * elegido. En navegadores sin la API, cae a la descarga clásica.
 */
export function GenerateInProgressRequisitionsPdfButton() {
  const { selectedCompany, selectedStation } = useCompanyStore()

  const { mutateAsync: downloadPdf, isPending } =
    useDownloadInProgressRequisitionsPdf()

  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!hovered) return

    const rect = e.currentTarget.getBoundingClientRect()

    const x =
      ((e.clientX - rect.left) / rect.width) * 100

    const y =
      ((e.clientY - rect.top) / rect.height) * 100

    setPos({ x, y })
  }

  const handleGenerate = async () => {
    if (!selectedCompany?.slug || !selectedStation || isPending) return

    const fileName = `listado-solicitudes-en-proceso-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}.pdf`

    // 1. Selección del destino ANTES de generar: el picker nativo requiere
    //    el gesto del usuario y define dónde se guardará el documento.
    let fileHandle: PdfFileHandle | null = null

    const showSaveFilePicker = (
      window as Window & { showSaveFilePicker?: SaveFilePicker }
    ).showSaveFilePicker

    if (showSaveFilePicker) {
      try {
        fileHandle = await showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Documento PDF',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        })
      } catch (error) {
        // El usuario cerró el diálogo sin elegir destino: no hay nada que hacer
        if ((error as DOMException)?.name === 'AbortError') return

        // La API falló por otra razón: continuar con la descarga clásica
        fileHandle = null
      }
    }

    // 2. Generación + escritura, con la barra de carga visible (isPending)
    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        locationId: selectedStation,
      })

      if (fileHandle) {
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = fileName
        anchor.click()
        URL.revokeObjectURL(url)
      }

      toast.success('Listado de solicitudes en proceso generado')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo generar el listado de solicitudes en proceso.'
      )
    }
  }

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={!selectedCompany?.slug || !selectedStation || isPending}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        variant="outline"
        className="
          relative overflow-hidden
          h-10 px-3
          border border-dashed
          border-teal-400/50 dark:border-teal-300/30
          bg-background/70 backdrop-blur
          text-teal-700 dark:text-teal-300
          font-medium tracking-wide
          shadow-sm transition-all duration-200
          hover:border-teal-500/60 dark:hover:border-teal-300/50
          hover:bg-teal-50/40 dark:hover:bg-teal-950/20
          hover:shadow-md hover:-translate-y-[1px]
          active:translate-y-0 active:shadow-sm
          focus-visible:ring-2 focus-visible:ring-teal-500/25
        "
        style={{
          backgroundImage: hovered
            ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(20,184,166,0.10), transparent 65%)`
            : 'none',
        }}
      >
        <FileDown className="size-4" />
         Generar
      </Button>

      {/* ============ BARRA DE CARGA NO INTERACTIVA ============ */}
      {isPending &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="
              fixed inset-0 z-[120]
              flex items-center justify-center
              bg-background/70 backdrop-blur-sm
            "
            role="status"
            aria-live="polite"
          >
            <div
              className="
                w-[min(92vw,440px)]
                rounded-2xl border
                bg-background/95
                p-6 shadow-2xl
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl border bg-background shadow-sm
                  "
                >
                  <FileDown className="size-5 animate-pulse text-teal-600 dark:text-teal-400" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-sm font-semibold leading-snug">
                    Generando listado de solicitudes en proceso hasta la fecha
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Preparando documento PDF, por favor espere…
                  </p>
                </div>
              </div>

              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="
                    h-full w-1/3 rounded-full
                    bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-400
                    animate-[req-pdf-indeterminate_1.2s_ease-in-out_infinite]
                  "
                />
              </div>
            </div>

            <style>{`
              @keyframes req-pdf-indeterminate {
                0%   { transform: translateX(-120%); }
                100% { transform: translateX(320%); }
              }
            `}</style>
          </div>,
          document.body
        )}
    </>
  )
}
