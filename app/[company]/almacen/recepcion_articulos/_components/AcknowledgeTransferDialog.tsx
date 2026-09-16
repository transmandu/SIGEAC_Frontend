'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { useAcknowledgeTransfer } from '@/actions/mantenimiento/almacen/solicitudes/salida/action'
import { useCompanyStore } from '@/stores/CompanyStore'
import { useAuth } from '@/contexts/AuthContext'
import type { IncomingTransfer } from '@/hooks/mantenimiento/almacen/solicitudes/useGetIncomingTransfers'
import { TransferLineDetail } from './TransferLineDetail'

/**
 * Confirma —o rechaza— que lo que llegó físicamente es lo que dice el
 * documento del traslado.
 *
 * Se rechaza cuando lo recibido no coincide: falta material, llegó dañado o no
 * llegó nada. En ese caso el motivo es obligatorio, porque la sede de origen
 * recibe ese texto y es lo único con lo que puede reclamar.
 */
export function AcknowledgeTransferDialog({
  transfer,
  open,
  onOpenChange,
}: {
  transfer: IncomingTransfer
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { selectedCompany, selectedStation } = useCompanyStore()
  const { user } = useAuth()
  const { acknowledgeTransfer } = useAcknowledgeTransfer()

  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const pending = acknowledgeTransfer.isPending
  const receivedBy = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()

  const submit = async (status: 'APPROVED' | 'REJECTED') => {
    await acknowledgeTransfer.mutateAsync({
      id: transfer.id,
      company: selectedCompany!.slug,
      status,
      received_by: receivedBy,
      // Se acusa por la sede activa: el documento puede traer líneas para
      // otras sedes y esas no se tocan.
      location_id: selectedStation!,
      rejection_reason: status === 'REJECTED' ? reason.trim() : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recepción del traslado {transfer.request_number}</DialogTitle>
          <DialogDescription>
            Enviado desde {transfer.location?.cod_iata ?? 'otra sede'}. Confirme
            que recibió todo lo que aparece abajo.
          </DialogDescription>
        </DialogHeader>

        {/* El scroll va en el cuerpo, no en el DialogContent: así el footer
            queda siempre visible sin recurrir a un sticky semitransparente. */}
        <div className="flex-1 space-y-4 overflow-y-auto py-2">
          {/* El mismo detalle que la lista: aquí se contrasta contra lo que
              está físicamente delante antes de dar el material por recibido. */}
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            {transfer.articles_dispatch?.map((line) => (
              <TransferLineDetail key={line.id} line={line} />
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Recibido por</Label>
            <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {receivedBy || 'Usuario actual'}
            </p>
          </div>

          {rejecting && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Motivo del rechazo
              </Label>
              <Textarea
                id="rejection-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej: llegaron 2 de 5 unidades, una con el empaque roto."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Los artículos volverán al almacén de origen y esta sede lo verá.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {rejecting ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setRejecting(false); setReason('') }}
              >
                Volver
              </Button>
              {reason.trim() && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => submit('REJECTED')}
                >
                  {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Confirmar rechazo
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => setRejecting(true)}>
                No recibí todo
              </Button>
              <Button type="button" onClick={() => submit('APPROVED')}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirmar recepción
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
