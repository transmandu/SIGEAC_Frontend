'use client'

import { toast } from 'sonner'
import { FileDown } from 'lucide-react'

import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { useCompanyStore } from '@/stores/CompanyStore'
import { useDownloadInProgressRequisitionsPdf } from '@/hooks/mantenimiento/compras/useDownloadInProgressRequisitionsPdf'
import { toCalendarPayload } from '@/lib/date'

/**
 * Botón que genera y descarga el PDF "Listado de Solicitudes en Proceso"
 * (requisiciones GENERALES con estado IN_PROGRESS de la estación actual).
 */
export function GenerateInProgressRequisitionsPdfButton() {
  const { selectedCompany, selectedStation } = useCompanyStore()

  const { mutateAsync: downloadPdf, isPending } =
    useDownloadInProgressRequisitionsPdf()

  const handleGenerate = async () => {
    if (!selectedCompany?.slug || !selectedStation || isPending) return

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        locationId: selectedStation,
      })

      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `listado-solicitudes-en-proceso-${(toCalendarPayload(new Date()) ?? '').replace(/-/g, '')}.pdf`

      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)

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
    <ActionTriggerButton className="px-3" onClick={handleGenerate}>
      <FileDown className="size-4" />
       Generar Reporte PDF
    </ActionTriggerButton>
  )
}
