"use client";

import { useEffect, useId, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  MessageSquareText,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useSeenPriorityChanges } from "@/hooks/mantenimiento/compras/useSeenPriorityChanges";
import { formatInstant } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { RequisitionPriorityChange } from "@/types/purchase";
import { PriorityTag } from "@/components/forms/mantenimiento/compras/_components/PriorityChoice";

/**
 * Color de la franja según la prioridad a la que pasó: el mismo código de
 * color de las tablas (rojo alta, naranja media, verde baja). Clases completas
 * y estáticas: Tailwind no ve las que se arman por partes.
 */
const TONES: Record<string, { panel: string; icon: string }> = {
  HIGH: {
    panel: "border-red-500/30 bg-red-500/5",
    icon: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
  MEDIUM: {
    panel: "border-orange-500/30 bg-orange-500/5",
    icon: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
  LOW: {
    panel: "border-emerald-500/30 bg-emerald-500/5",
    icon: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
};

const FALLBACK_TONE = {
  panel: "border-slate-200 bg-muted/30 dark:border-slate-700/60",
  icon: "bg-muted text-muted-foreground",
};

/** Una solicitud cerrada ya no necesita que nadie reaccione a su prioridad. */
const CLOSED_STATUSES = ["APPROVED", "REJECTED"];

interface Props {
  requisition: {
    status: string;
    priority_change?: RequisitionPriorityChange | null;
  };
  className?: string;
}

/**
 * Aviso del último cambio de prioridad de una solicitud, para quien la abre
 * después de que alguien la subió (o bajó). Lo comparten el detalle de compras
 * aeronáutico, el de compras general y el de almacén/solicitante: cada página
 * decide su ancho y su sitio; el aspecto es el mismo.
 *
 * La primera vez que el usuario ve un cambio aparece desplegado, con quién,
 * cuándo y el motivo; las siguientes veces queda plegado en una línea que se
 * despliega al pulsarla. Un cambio nuevo vuelve a aparecer desplegado.
 */
export default function PriorityChangeNotice({
  requisition,
  className,
}: Props) {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const change = requisition.priority_change;

  // Sin usuario y empresa la clave de "ya visto" saldría incompleta y cambiaría
  // al cargarlos: se espera a tenerlos para decidir una sola vez.
  if (
    !change ||
    !user ||
    !selectedCompany ||
    CLOSED_STATUSES.includes(requisition.status)
  ) {
    return null;
  }

  // `key` por cambio: al llegar uno nuevo con la página abierta, el aviso se
  // monta de nuevo y vuelve a nacer desplegado, sin reiniciarlo a mano.
  return (
    <Notice
      key={change.id}
      change={change}
      seenKey={`${selectedCompany.slug}:${user.id}:${change.id}`}
      className={className}
    />
  );
}

function Notice({
  change,
  seenKey,
  className,
}: {
  change: RequisitionPriorityChange;
  seenKey: string;
  className?: string;
}) {
  const timeZone = useCompanyTimezone();
  const detailsId = useId();
  const markSeen = useSeenPriorityChanges((state) => state.markSeen);

  // Se lee el registro tal cual está al montar, sin suscribirse: marcarlo como
  // visto justo después no debe plegar el aviso que el usuario tiene delante, y
  // el valor "inicial" que da una suscripción durante la hidratación (vacío)
  // lo dejaría siempre desplegado.
  const [open, setOpen] = useState(
    () => !useSeenPriorityChanges.getState().seen.includes(seenKey),
  );

  useEffect(() => {
    markSeen(seenKey);
  }, [markSeen, seenKey]);

  const tone = TONES[change.to_priority] ?? FALLBACK_TONE;
  const Icon = change.is_escalation ? ArrowUp : ArrowDown;
  const meta = `Por ${change.changed_by} · ${formatInstant(change.changed_at, timeZone, "dateTime")}`;

  return (
    <section
      role="status"
      aria-label="Cambio de prioridad"
      className={cn("rounded-xl border", tone.panel, className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full touch-manipulation items-center gap-3 rounded-xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            tone.icon,
          )}
        >
          <Icon aria-hidden className="size-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 md:flex-nowrap">
          <span className="text-sm font-semibold text-foreground md:shrink-0">
            {change.is_escalation ? "Prioridad elevada" : "Prioridad reducida"}
          </span>

          <span className="flex items-center gap-2 text-base font-semibold text-foreground md:shrink-0">
            <PriorityTag value={change.from_priority} />
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <PriorityTag value={change.to_priority} />
          </span>

          {!open && (
            <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground md:block">
              {meta}
            </span>
          )}
        </div>

        {!open && change.reason && (
          <MessageSquareText
            role="img"
            aria-label="Incluye motivo"
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}

        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={detailsId}
          className="space-y-2 pr-3 pb-3 pl-15 motion-safe:animate-reveal"
        >
          <p className="text-[13px] text-muted-foreground wrap-anywhere">
            {meta}
          </p>

          {change.reason && (
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm wrap-anywhere dark:border-slate-700/60 dark:bg-slate-900/60">
              {change.reason}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
