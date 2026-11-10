"use client";

import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import { ArrowRight, BellRing, PackageCheck, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

/** Transiciones que el badge de estado permite avanzar con un clic. */
export const NEXT_REQUISITION_STATUS: Record<string, string> = {
  CREATED: "RECEIVED",
  RECEIVED: "IN_PROGRESS",
};

export const ADVANCE_REQUISITION_TOOLTIP: Record<string, string> = {
  CREATED: "Marcar esta requisición como recibida",
  RECEIVED: "Iniciar proceso de atención / ejecución",
};

interface StepCopy {
  icon: LucideIcon;
  title: string;
  /** Qué significa el estado nuevo, en los términos del solicitante. */
  meaning: string;
  /** Lo que el estado nuevo NO significa: es el equívoco que se busca evitar. */
  caveat: string;
  notice: string;
  action: string;
}

const STEP_COPY: Record<string, StepCopy> = {
  CREATED: {
    icon: PackageCheck,
    title: "Marcar la requisición como recibida",
    meaning:
      "Compras confirma que la solicitud llegó y queda bajo su resguardo.",
    caveat:
      "No implica que se haya iniciado la gestión ni que esté cotizada: solo acusa la recepción.",
    notice:
      "Se notificará a quien creó la solicitud que ya fue recibida por Compras.",
    action: "Sí, marcar como recibida",
  },
  RECEIVED: {
    icon: PlayCircle,
    title: "Iniciar el proceso de la requisición",
    meaning:
      "Compras empezó a gestionar esta solicitud: pasa a estar en proceso frente a las demás recibidas.",
    caveat:
      "No implica que ya esté cotizada ni aprobada: la cotización es un paso posterior.",
    notice:
      "Se notificará a quien creó la solicitud que su requisición está en proceso.",
    action: "Sí, iniciar el proceso",
  },
};

const STATUS_PILL: Record<string, { label: string; tone: TagTone }> = {
  CREATED: { label: "Creada", tone: "slate" },
  RECEIVED: { label: "Recibida", tone: "sky" },
  IN_PROGRESS: { label: "En proceso", tone: "amber" },
};

const StatusPill = ({ status }: { status: string }) => {
  const pill = STATUS_PILL[status];

  return <TagBadge tone={pill?.tone}>{pill?.label ?? status}</TagBadge>;
};

interface Props {
  /** Estado actual; determina qué transición se está confirmando. */
  status?: string;
  orderNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Debe lanzar si falla: el diálogo solo se cierra si resuelve. */
  onConfirm: () => Promise<unknown> | void;
  isPending?: boolean;
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
  const [shown, setShown] = useState<{
    copy: StepCopy;
    from: string;
    to: string;
  } | null>(null);

  const copy = STEP_COPY[status ?? ""];
  const nextStatus = NEXT_REQUISITION_STATUS[status ?? ""];

  // Ajuste de estado al cambiar una prop (patrón documentado de React): se
  // actualiza durante el render, solo cuando la transición realmente cambió.
  if (
    copy &&
    nextStatus &&
    (!shown || shown.from !== status || shown.to !== nextStatus)
  ) {
    setShown({ copy, from: status!, to: nextStatus });
  }

  if (!shown) return null;

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={shown.copy.title}
      entityName={orderNumber ? `la requisición ${orderNumber}` : undefined}
      icon={shown.copy.icon}
      tone="primary"
      confirmLabel={shown.copy.action}
      isPending={isPending}
      onConfirm={onConfirm}
      extra={
        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border/70 bg-muted/30 py-2.5">
            <StatusPill status={shown.from} />
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <StatusPill status={shown.to} />
          </div>

          <p className="rounded-xl border border-amber-300/50 bg-amber-50/50 px-3 py-2 text-[13px] leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
            {shown.copy.caveat}
          </p>

          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
            <BellRing className="mt-px size-3.5 shrink-0" />
            {shown.copy.notice}
          </p>
        </div>
      }
    >
      {shown.copy.meaning}
    </ConfirmActionDialog>
  );
}
