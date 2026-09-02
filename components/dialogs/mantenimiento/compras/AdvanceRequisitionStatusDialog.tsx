'use client'

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
import { cn } from '@/lib/utils'
import { ArrowRight, BellRing, Loader2, PackageCheck, PlayCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useRef } from 'react'

/** Transiciones que el badge de estado permite avanzar con un clic. */
export const NEXT_REQUISITION_STATUS: Record<string, string> = {
  CREATED: 'RECEIVED',
  RECEIVED: 'IN_PROGRESS',
}

export const ADVANCE_REQUISITION_TOOLTIP: Record<string, string> = {
  CREATED: 'Marcar esta requisición como recibida',
  RECEIVED: 'Iniciar proceso de atención / ejecución',
}

interface StepCopy {
  icon: LucideIcon
  accent: string
  title: string
  /** Qué significa el estado nuevo, en los términos del solicitante. */
  meaning: string
  /** Lo que el estado nuevo NO significa: es el equívoco que se busca evitar. */
  caveat: string
  notice: string
  action: string
}

const STEP_COPY: Record<string, StepCopy> = {
  CREATED: {
    icon: PackageCheck,
    accent: 'text-sky-500',
    title: 'Marcar la requisición como recibida',
    meaning:
      'Compras confirma que la solicitud llegó y queda bajo su resguardo.',
    caveat:
      'No implica que se haya iniciado la gestión ni que esté cotizada: solo acusa la recepción.',
    notice:
      'Se notificará a quien creó la solicitud que ya fue recibida por Compras.',
    action: 'Sí, marcar como recibida',
  },
  RECEIVED: {
    icon: PlayCircle,
    accent: 'text-yellow-500',
    title: 'Iniciar el proceso de la requisición',
    meaning:
      'Compras empezó a gestionar esta solicitud: pasa a estar en proceso frente a las demás recibidas.',
    caveat:
      'No implica que ya esté cotizada ni aprobada: la cotización es un paso posterior.',
    notice:
      'Se notificará a quien creó la solicitud que su requisición está en proceso.',
    action: 'Sí, iniciar el proceso',
  },
}

const STATUS_PILL: Record<string, { label: string; className: string }> = {
  CREATED: {
    label: 'CREADA',
    className: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  },
  RECEIVED: {
    label: 'RECIBIDA',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  IN_PROGRESS: {
    label: 'EN PROCESO',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  },
}

const StatusPill = ({ status }: { status: string }) => {
  const pill = STATUS_PILL[status]

  return (
    <span
      className={cn(
        'select-none whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm',
        pill?.className,
      )}
    >
      {pill?.label ?? status}
    </span>
  )
}

interface Props {
  /** Estado actual; determina qué transición se está confirmando. */
  status?: string
  orderNumber?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

/**
 * Confirmación del avance de estado desde el badge. El badge es un objetivo
 * pequeño dentro de una fila y el cambio no es reversible desde la interfaz,
 * así que el paso intermedio explica qué se le comunica al solicitante —y qué
 * no— antes de disparar la notificación.
 */
export function AdvanceRequisitionStatusDialog({
  status,
  orderNumber,
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: Props) {
  /**
   * Al confirmar, el llamador limpia el estado y `status` queda vacío. Se
   * retiene la última transición para que el contenido no desaparezca a media
   * animación de salida.
   */
  const lastCopy = useRef<{ copy: StepCopy; from: string; to: string } | null>(null)

  const copy = STEP_COPY[status ?? '']
  const nextStatus = NEXT_REQUISITION_STATUS[status ?? '']

  if (copy && nextStatus) {
    lastCopy.current = { copy, from: status!, to: nextStatus }
  }

  const shown = lastCopy.current

  if (!shown) return null

  const Icon = shown.copy.icon

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent className="max-w-md gap-3 p-5">
        <AlertDialogHeader className="space-y-1.5">
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            <Icon className={cn('size-5', shown.copy.accent)} />
            {shown.copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {orderNumber ? (
              <>
                Requisición{' '}
                <span className="font-mono font-medium text-foreground">{orderNumber}</span>.{' '}
              </>
            ) : null}
            {shown.copy.meaning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-3 rounded-lg border border-border/70 bg-muted/30 py-2.5">
            <StatusPill status={shown.from} />
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <StatusPill status={shown.to} />
          </div>

          <p className="rounded-lg border border-amber-300/50 bg-amber-50/50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
            {shown.copy.caveat}
          </p>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <BellRing className="mt-px size-3.5 shrink-0" />
            {shown.copy.notice}
          </p>
        </div>

        <AlertDialogFooter className="gap-2 border-t pt-4 sm:gap-0">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 h-9 border-border/70 bg-background/70 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 gap-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow-md"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Icon className="size-3.5" />
            )}
            {shown.copy.action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
