'use client'

import {
  assertCanSendToReinspection,
  useSendToReinspection,
} from '@/actions/mantenimiento/control_calidad/cuarentena/actions'
import RegisterArticleForm from '@/components/forms/mantenimiento/almacen/RegisterArticleForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useGetArticleById } from '@/hooks/mantenimiento/almacen/articulos/useGetArticleById'
import { cn } from '@/lib/utils'
import { formatQuarantineDate } from '@/lib/warehouse/quarantine'
import { useCompanyStore } from '@/stores/CompanyStore'
import type { QuarantineRecord } from '@/types/quarantine'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  PencilLine,
  SendHorizonal,
  ShieldX,
  User,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

const MIN_NOTES_LENGTH = 5

interface Props {
  record: QuarantineRecord
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Corrección de un artículo retenido. Reutiliza el formulario de artículo
 * completo —cada categoría necesita sus propios campos (vida límite, lote,
 * calibración) y solo ese formulario los conoce— y le inyecta un bloque de
 * acciones vacío para quedarse con su estado, porque el botón real vive en el
 * footer del diálogo, fuera del área que se desplaza.
 */
export function ResolveQuarantineDialog({ record, open, onOpenChange }: Props) {
  const { selectedCompany } = useCompanyStore()
  const queryClient = useQueryClient()
  const { sendToReinspection } = useSendToReinspection()

  const [notes, setNotes] = useState('')
  /**
   * Estado del formulario embebido, elevado hasta aquí: el botón está fuera de
   * él y necesita saber si hay algo que guardar y si está ocupado.
   */
  const [formState, setFormState] = useState({ busy: false, canSave: false })
  /**
   * El artículo ya se guardó pero el pase falló: el reintento no debe volver a
   * guardar (los cambios ya están) ni cerrar como si se hubiera perdido todo.
   */
  const [articleSaved, setArticleSaved] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Estable entre renders y sin re-render si el estado no cambió: el formulario
  // la usa como dependencia de efecto.
  const handleFormState = useCallback((next: { busy: boolean; canSave: boolean }) => {
    setFormState((prev) =>
      prev.busy === next.busy && prev.canSave === next.canSave ? prev : next,
    )
  }, [])

  const { data: article, isLoading } = useGetArticleById(
    open ? String(record.article_id) : '',
    selectedCompany?.slug,
  )

  const notesAreValid = notes.trim().length >= MIN_NOTES_LENGTH
  const sending = sendToReinspection.isPending
  const busy = formState.busy || sending || checkingEligibility

  const cycles = record.cycles ?? []
  const currentCycle = cycles.length > 0
    ? cycles.reduce((latest, cycle) => (cycle.cycle_number > latest.cycle_number ? cycle : latest))
    : null

  const close = () => {
    setNotes('')
    setFormState({ busy: false, canSave: false })
    setArticleSaved(false)
    onOpenChange(false)
  }

  const sendToQuality = async () => {
    await sendToReinspection.mutateAsync({
      id: record.id,
      resolution_notes: notes.trim(),
    })

    close()
  }

  /**
   * El formulario guardó; se continúa con el pase. Si el pase falla, el diálogo
   * queda abierto avisando que la corrección sí quedó guardada: cerrarlo daría a
   * entender que se perdió, y el reintento solo repite el pase.
   */
  const handleArticleSaved = async () => {
    queryClient.invalidateQueries({ queryKey: ['article', String(record.article_id)] })
    queryClient.invalidateQueries({ queryKey: ['quarantine-articles'] })

    setArticleSaved(true)

    await sendToQuality()
  }

  /**
   * Con cambios pendientes dispara el submit del formulario embebido, que al
   * terminar encadena el envío; sin ellos va directo. El botón vive fuera del
   * <form>, así que el submit se provoca por requestSubmit().
   */
  const handleConfirm = async () => {
    if (!notesAreValid || busy) return

    // Ya guardado en un intento anterior: solo falta el pase.
    if (articleSaved) {
      await sendToQuality()
      return
    }

    if (formState.canSave) {
      // Se comprueba antes de guardar porque los dos pasos no comparten
      // transacción: si el pase no va a ser posible, no se toca el artículo.
      if (selectedCompany?.slug) {
        try {
          setCheckingEligibility(true)
          await assertCanSendToReinspection(selectedCompany.slug, record.id)
        } catch (error) {
          const message = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message

          toast.error('No se puede enviar a re-inspección', {
            description: message ?? 'El registro de cuarentena ya no admite esta acción.',
          })

          return
        } finally {
          setCheckingEligibility(false)
        }
      }

      scrollRef.current?.querySelector('form')?.requestSubmit()
      return
    }

    await sendToQuality()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="flex max-h-[92vh] max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldX className="size-4 text-red-500" />
            Corregir artículo en cuarentena
          </DialogTitle>
          <DialogDescription className="text-xs">
            Resuelva el hallazgo de calidad y describa qué corrigió. El artículo pasará a
            re-inspección.
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Hallazgo: el punto de partida de todo lo que sigue */}
          <section
            className={cn(
              'rounded-xl border p-4',
              record.is_overdue
                ? 'border-red-500/40 bg-red-500/5'
                : 'border-slate-200/70 bg-slate-50/60 dark:border-slate-700/60 dark:bg-slate-900/40',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="select-none rounded-md border border-emerald-200/50 bg-emerald-100/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/30 dark:text-emerald-300">
                  P/N
                </span>
                <span className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {record.article?.part_number ?? 'Sin part number'}
                </span>
                {record.article?.serial && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    S/N {record.article.serial}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {cycles.length > 1 && (
                  <Badge className="select-none rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm dark:text-amber-300">
                    Intento {cycles.length}
                  </Badge>
                )}
                {record.is_overdue && (
                  <Badge className="select-none gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-700 shadow-sm dark:text-red-300">
                    <AlertTriangle className="size-3" />
                    Plazo vencido
                  </Badge>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-800 dark:text-slate-200">
              {currentCycle?.reason ?? record.reason}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {record.inspector ?? '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3" />
                {formatQuarantineDate(record.quarantine_entry_date)}
              </span>
              {record.days_in_quarantine !== null && (
                <span>
                  {record.days_in_quarantine} día(s) retenido
                  {record.days_remaining !== null && (
                    <>
                      {' · '}
                      {record.days_remaining >= 0
                        ? `restan ${record.days_remaining}`
                        : `vencido por ${Math.abs(record.days_remaining)}`}
                    </>
                  )}
                </span>
              )}
            </div>
          </section>

          {/* Declaración: lo que el inspector verificará */}
          <section className="space-y-2 rounded-xl border border-slate-200/70 p-4 dark:border-slate-700/60">
            <Label htmlFor="q-notes" className="text-sm font-semibold">
              ¿Qué corrigió? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="q-notes"
              value={notes}
              disabled={busy}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
              placeholder="Ej.: se cargó el certificado 8130-3 faltante y se corrigió el número de serie."
            />
            {notes.length > 0 && !notesAreValid && (
              <p className="text-xs text-destructive">
                Mínimo {MIN_NOTES_LENGTH} caracteres: es lo que el inspector va a verificar.
              </p>
            )}
          </section>

          {isLoading || !article ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RegisterArticleForm
              key={article.id}
              isEditing
              initialData={article}
              category={article.batch?.category}
              onEditSuccess={handleArticleSaved}
              // El formulario oculta sus acciones y reporta su estado: el botón
              // vive en el footer del diálogo, fuera del área que se desplaza.
              onStateChange={handleFormState}
            />
          )}
        </div>

        <div className="shrink-0 border-t px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={cn(
                'text-[11px]',
                articleSaved ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
              )}
            >
              {articleSaved
                ? 'Los cambios del artículo ya se guardaron; falta enviarlo a re-inspección.'
                : !notesAreValid
                  ? 'Describa la corrección para poder enviar el artículo.'
                  : formState.canSave
                    ? 'Se guardarán los cambios del artículo y pasará a re-inspección.'
                    : 'El artículo pasará a re-inspección con la corrección descrita.'}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={close} disabled={busy}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={busy || !notesAreValid}
                className="gap-1.5"
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : formState.canSave && !articleSaved ? (
                  <PencilLine className="size-3.5" />
                ) : (
                  <SendHorizonal className="size-3.5" />
                )}
                {articleSaved
                  ? 'Reintentar envío a re-inspección'
                  : formState.canSave
                    ? 'Guardar y enviar a re-inspección'
                    : 'Enviar a re-inspección'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
