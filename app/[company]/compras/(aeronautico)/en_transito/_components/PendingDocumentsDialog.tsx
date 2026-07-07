'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useConsignRequirementDocuments,
  type RequirementConsignment,
} from '@/actions/mantenimiento/almacen/inventario/articulos/actions'
import { useCompanyStore } from '@/stores/CompanyStore'
import { FileUpIcon, FileWarning, Loader2, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { TransitArticle } from '@/types/purchase'

interface Props {
  article: TransitArticle
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se ejecuta cuando toda la documentación pendiente quedó consignada. */
  onCompleted: () => void | Promise<void>
}

type ConsignmentState = Record<number, { file?: File; isPhysical: boolean }>

/**
 * Bloqueo documental del pase a recepción: muestra los requerimientos
 * (heredados desde la requisición) que aún no tienen documento consignado y
 * exige subir el archivo — o marcar la recepción física — de cada uno antes
 * de permitir la transición TRANSIT → RECEPTION.
 */
export function PendingDocumentsDialog({
  article,
  open,
  onOpenChange,
  onCompleted,
}: Props) {
  const { selectedCompany } = useCompanyStore()
  const { consignRequirementDocuments } = useConsignRequirementDocuments()

  const [consignments, setConsignments] = useState<ConsignmentState>({})

  const pendingRequirements = (article.document_requirements ?? []).filter(
    (req) => req.documents.length === 0
  )

  const setFile = (requirementId: number, file?: File) => {
    setConsignments((prev) => ({
      ...prev,
      [requirementId]: { ...prev[requirementId], isPhysical: prev[requirementId]?.isPhysical ?? false, file },
    }))
  }

  const setPhysical = (requirementId: number, isPhysical: boolean) => {
    setConsignments((prev) => ({
      ...prev,
      [requirementId]: { ...prev[requirementId], isPhysical },
    }))
  }

  const allResolved = pendingRequirements.every((req) => {
    const entry = consignments[req.id]
    return !!entry?.file || !!entry?.isPhysical
  })

  const busy = consignRequirementDocuments.isPending

  const handleConfirm = async () => {
    if (!selectedCompany?.slug || !allResolved) return

    const payload: RequirementConsignment[] = pendingRequirements.map((req) => ({
      requirementId: req.id,
      file: consignments[req.id]?.file,
      isPhysical: consignments[req.id]?.isPhysical ?? false,
    }))

    await consignRequirementDocuments.mutateAsync({
      company: selectedCompany.slug,
      consignments: payload,
    })

    toast.success('Documentación consignada', {
      description: 'Los documentos requeridos fueron registrados correctamente.',
    })

    setConsignments({})
    onOpenChange(false)
    await onCompleted()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileWarning className="size-5 text-amber-500" />
            Documentación requerida pendiente
          </AlertDialogTitle>
          <AlertDialogDescription>
            El artículo <span className="font-mono font-medium">{article.part_number}</span>{' '}
            no puede pasar a recepción hasta consignar la documentación exigida
            en la requisición. Suba cada documento o marque su recepción en físico.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto py-1 pr-1">
          {pendingRequirements.map((req) => {
            const entry = consignments[req.id]
            const resolved = !!entry?.file || !!entry?.isPhysical

            return (
              <div
                key={req.id}
                className={
                  resolved
                    ? 'space-y-2 rounded-lg border border-emerald-300/60 bg-emerald-50/40 p-3 dark:border-emerald-700/40 dark:bg-emerald-950/20'
                    : 'space-y-2 rounded-lg border border-border bg-muted/30 p-3'
                }
              >
                <div>
                  <p className="text-sm font-medium">
                    Certificado{' '}
                    <span className="font-semibold text-primary">
                      {req.document_type?.name ?? 'Documento'}
                    </span>
                  </p>
                  {req.document_type?.regulation && (
                    <p className="text-[10px] text-muted-foreground">
                      {req.document_type.regulation}
                    </p>
                  )}
                </div>

                <div className="relative h-9 w-full">
                  <FileUpIcon className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={busy}
                    onChange={(e) => setFile(req.id, e.target.files?.[0])}
                    className="h-9 cursor-pointer pl-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`physical-${req.id}`}
                    checked={entry?.isPhysical ?? false}
                    disabled={busy}
                    onCheckedChange={(checked) => setPhysical(req.id, checked === true)}
                  />
                  <Label
                    htmlFor={`physical-${req.id}`}
                    className="cursor-pointer text-xs font-normal"
                  >
                    Documento recibido en físico
                  </Label>
                </div>

                <p className="text-[10px] text-muted-foreground">
                  {entry?.file
                    ? entry.file.name
                    : 'PDF o imagen. Máx. 10 MB. Requerido: archivo o constancia física.'}
                </p>
              </div>
            )
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <Button
            disabled={busy || !allResolved}
            onClick={handleConfirm}
            className="gap-1.5"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <PackageCheck className="size-3.5" />
            )}
            Consignar y recibir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
