'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { FileDown } from 'lucide-react'

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
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
      <ActionTriggerButton className="px-3">
        <FileDown className="size-4" />
         Generar
      </ActionTriggerButton>

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
                  <FileDown className="size-5 animate-pulse text-primary" />
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
                    bg-gradient-to-r from-primary/80 via-primary to-primary/80
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
