'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, FileText, Loader2 } from 'lucide-react'

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
import { useAuth } from '@/contexts/AuthContext'
import { useMyEmployee } from '@/hooks/sistema/usuario/useMyEmployee'
import { useDownloadRequisitionPdf } from '@/hooks/mantenimiento/compras/useDownloadRequisitionPdf'
import {
  useGetRequisitionPdfReceivers,
  type RequisitionPdfReceiver,
} from '@/hooks/mantenimiento/compras/useGetRequisitionPdfReceivers'

/**
 * Personal de compras: recibe sus propias requisiciones, así que no elige a
 * nadie en el select — firma con su propia ficha aunque esté afiliada a otra
 * compañía distinta a la de la requisición.
 */
const SELF_RECEIVER_ROLES = [
  'JEFE_COMPRAS',
  'ANALISTA_COMPRAS',
  'ASISTENTE_COMPRAS',
]

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
  const { user } = useAuth()
  const [receiverId, setReceiverId] = useState<string>('')

  const userRoles = user?.roles?.map((role) => role.name) ?? []
  const isSelfReceiver = SELF_RECEIVER_ROLES.some((role) =>
    userRoles.includes(role)
  )

  // La selección no se conserva entre aperturas: cada descarga debe elegir
  // conscientemente al receptor.
  useEffect(() => {
    if (!open) setReceiverId('')
  }, [open])

  const { data: myEmployee, isLoading: isMyEmployeeLoading } = useMyEmployee()

  const { data: receivers, isLoading: isReceiversLoading } =
    useGetRequisitionPdfReceivers(
      open && !isSelfReceiver ? selectedCompany?.slug : undefined
    )

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

  const canDownload = isSelfReceiver ? !!myEmployee : !!receiverId

  const handleDownload = async () => {
    if (!selectedCompany?.slug || !canDownload || isPending) return

    try {
      const blob = await downloadPdf({
        company: selectedCompany.slug,
        requisitionId: req.id,
        ...(isSelfReceiver
          ? ({ receiverSelf: true } as const)
          : { receiverEmployeeId: Number(receiverId) }),
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
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* ===== Encabezado ===== */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b bg-muted/30">
          <div className="flex items-start gap-3.5">
            <div
              className="
                flex size-11 shrink-0 items-center justify-center
                rounded-xl border bg-background shadow-sm
                text-blue-600
              "
            >
              <FileText className="size-5" />
            </div>

            <div className="min-w-0 space-y-1 text-left">
              <DialogTitle className="text-base leading-snug">
                Descargar requisición
              </DialogTitle>
              <div
                className="
                  inline-flex max-w-full items-center
                  rounded-md border bg-background
                  px-2 py-0.5
                  font-mono text-xs font-medium tracking-wide
                  text-muted-foreground
                "
                title={req.order_number}
              >
                <span className="truncate">{req.order_number}</span>
              </div>
              <DialogDescription className="text-xs leading-relaxed">
                {isSelfReceiver
                  ? 'El documento lo incluye a usted en la sección “Departamento Receptor” y su firma en “Recibe conforme”.'
                  : 'El documento incluye al receptor seleccionado en la sección “Departamento Receptor” y su firma en “Recibe conforme”.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ===== Cuerpo ===== */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Departamento receptor
            </label>

            {isSelfReceiver ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Usted recibe esta solicitud y firma en &ldquo;Recibe
                  conforme&rdquo;.
                </p>

                {isMyEmployeeLoading ? (
                  <div
                    className="
                      flex h-10 items-center gap-2
                      text-sm text-muted-foreground
                    "
                  >
                    <Loader2 className="size-4 animate-spin" />
                    Cargando sus datos...
                  </div>
                ) : myEmployee ? (
                  <div className="rounded-md border bg-muted/30 px-3 py-2.5">
                    <p className="text-sm font-medium">
                      {myEmployee.first_name} {myEmployee.last_name}
                    </p>
                    {(myEmployee.job_title?.name ||
                      myEmployee.department?.name) && (
                      <p className="text-xs text-muted-foreground">
                        {[
                          myEmployee.job_title?.name,
                          myEmployee.department?.name,
                        ]
                          .filter(Boolean)
                          .join(' — ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">
                    Su usuario no tiene una ficha de empleado activa, por lo que
                    no puede firmar como receptor.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Personal de Compras, Administración o RRHH que recibirá la
                  solicitud.
                </p>
                <Select value={receiverId} onValueChange={setReceiverId}>
                  <SelectTrigger className="w-full h-10">
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
              </>
            )}
          </div>
        </div>

        {/* ===== Pie ===== */}
        <div
          className="
            flex items-center justify-end gap-2
            px-6 py-4 border-t bg-muted/30
          "
        >
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            className="gap-2 min-w-[150px]"
            onClick={handleDownload}
            disabled={!canDownload || isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {isPending ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
