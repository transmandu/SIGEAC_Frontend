'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useDownloadRequisitionPdf } from '@/hooks/mantenimiento/compras/useDownloadRequisitionPdf'
import {
  useGetRequisitionPdfReceivers,
  type RequisitionPdfReceiver,
} from '@/hooks/mantenimiento/compras/useGetRequisitionPdfReceivers'

type Props = {
  req: {
    id: number
    order_number: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Diálogo de descarga del formato "REQUISICION" (PDF generado en el backend).
 * Pide seleccionar el empleado del departamento receptor (Compras,
 * Administración o RRHH), que se imprime en la sección "DEPARTAMENTO
 * RECEPTOR" y firma en "Recibe conforme".
 */
export default function DownloadRequisitionPdfDialog({
  req,
  open,
  onOpenChange,
}: Props) {
  const { selectedCompany } = useCompanyStore()
  const [receiverId, setReceiverId] = useState<string>('')

  // La selección no se conserva entre aperturas: cada descarga debe elegir
  // conscientemente al receptor.
  useEffect(() => {
    if (!open) setReceiverId('')
  }, [open])

  const { data: receivers, isLoading: isReceiversLoading } =
    useGetRequisitionPdfReceivers(open ? selectedCompany?.slug : undefined)

  const { mutateAsync: downloadPdf, isPending } = useDownloadRequisitionPdf()

  // Agrupados por departamento para el select
  const receiversByDepartment = useMemo(() => {
    const groups = new Map<string, RequisitionPdfReceiver[]>()
    for (const receiver of receivers ?? []) {
      const department = receiver.department?.name ?? 'Sin departamento'
      groups.set(department, [...(groups.get(department) ?? []), receiver])
    }
    return Array.from(groups.entries())
  }, [receivers])

  const handleDownload = async () => {
    if (!selectedCompany?.slug || !receiverId || isPending) return

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        requisitionId: req.id,
        receiverEmployeeId: Number(receiverId),
      })

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${req.order_number}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)

      toast.success(`Requisición ${req.order_number} generada`)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo generar el PDF de la requisición.'
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Descargar requisición {req.order_number}</DialogTitle>
          <DialogDescription>
            Seleccione el responsable del departamento receptor (Compras,
            Administración o RRHH) que recibirá la solicitud.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Departamento receptor
            </label>
            <Select value={receiverId} onValueChange={setReceiverId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isReceiversLoading
                      ? 'Cargando empleados...'
                      : 'Seleccionar empleado'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {receiversByDepartment.map(([department, employees]) => (
                  <SelectGroup key={department}>
                    <SelectLabel>{department}</SelectLabel>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={String(employee.id)}
                      >
                        {employee.first_name} {employee.last_name}
                        {employee.job_title?.name
                          ? ` — ${employee.job_title.name}`
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                {!isReceiversLoading && !receivers?.length && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay empleados disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={!receiverId || isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {isPending ? 'Generando...' : 'Descargar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
