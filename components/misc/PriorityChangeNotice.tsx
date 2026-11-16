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

/**
 * Variante para las fichas de compras: un anuncio centrado y de ancho acotado,
 * con el fondo y el borde, planos, del color de la prioridad a la que pasó. En
 * claro el fondo es el tono 50 de la paleta; en oscuro, una transparencia del
 * color sobre el fondo de la página (un tono 50 sólido brillaría). Cada capa
 * lleva su equivalente oscuro explícito.
 */
const SECTION_TONES: Record<
  string,
  { panel: string; icon: string; reason: string }
> = {
  HIGH: {
    panel:
      "border-red-300/80 bg-red-50 dark:border-red-400/25 dark:bg-red-500/10",
    icon: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300",
    reason:
      "border-red-200/70 bg-white/70 dark:border-red-400/20 dark:bg-black/20",
  },
  MEDIUM: {
    panel:
      "border-orange-300/80 bg-orange-50 dark:border-orange-400/25 dark:bg-orange-500/10",
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
    reason:
      "border-orange-200/70 bg-white/70 dark:border-orange-400/20 dark:bg-black/20",
  },
  LOW: {
    panel:
      "border-emerald-300/80 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10",
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
    reason:
      "border-emerald-200/70 bg-white/70 dark:border-emerald-400/20 dark:bg-black/20",
  },
};

const SECTION_FALLBACK = {
  panel:
    "border-slate-200 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/30",
  icon: "bg-slate-100 text-muted-foreground dark:bg-slate-800",
  reason:
    "border-slate-200 bg-white/70 dark:border-slate-700/60 dark:bg-black/20",
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
  /**
   * `tinted` (por defecto) es el aviso con relleno de color de la ficha de
   * almacén; `section` es el de las fichas de compras: más pequeño, centrado y
   * con el color plano de la prioridad.
   */
  variant?: "tinted" | "section";
  className?: string;
}

/**
 * Aviso del último cambio de prioridad de una solicitud, para quien la abre
 * después de que alguien la subió (o bajó). Lo comparten el detalle de compras
 * aeronáutico, el de compras general y el de almacén/solicitante. Cada ficha
 * conserva su estilo: `variant` elige el de compras o el de almacén, y la
 * página solo decide su sitio.
 *
 * La primera vez que el usuario ve un cambio aparece desplegado, con quién, el
 * día y el motivo; las siguientes veces queda plegado en una línea que se
 * despliega al pulsarla. Un cambio nuevo vuelve a aparecer desplegado.
 */
export default function PriorityChangeNotice({
  requisition,
  variant = "tinted",
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
      variant={variant}
      className={className}
    />
  );
}

function Notice({
  change,
  seenKey,
  variant,
  className,
}: {
  change: RequisitionPriorityChange;
  seenKey: string;
  variant: "tinted" | "section";
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
  const sectionTone = SECTION_TONES[change.to_priority] ?? SECTION_FALLBACK;
  const section = variant === "section";
  const Icon = change.is_escalation ? ArrowUp : ArrowDown;
  // Solo el día, dicho como frase: la hora es para consultar en el registro, y
  // una fecha suelta junto al nombre no se entiende de un vistazo.
  const meta = `Por ${change.changed_by} el ${formatInstant(change.changed_at, timeZone, "d MMM yyyy")}`;

  return (
    <section
      role="status"
      aria-label="Cambio de prioridad"
      className={cn(
        "rounded-xl border",
        section
          ? cn("mx-auto w-full max-w-3xl", sectionTone.panel)
          : tone.panel,
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full touch-manipulation items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          section ? "px-4 py-2.5" : "p-3",
        )}
      >
        {section ? (
          <div
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-lg",
              sectionTone.icon,
            )}
          >
            <Icon aria-hidden className="size-4" />
          </div>
        ) : (
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg",
              tone.icon,
            )}
          >
            <Icon aria-hidden className="size-5" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 md:flex-nowrap">
          <span className="text-sm font-semibold text-foreground md:shrink-0">
            {change.is_escalation ? "Prioridad elevada" : "Prioridad reducida"}
          </span>

          <span
            className={cn(
              "flex items-center gap-2 font-semibold text-foreground md:shrink-0",
              section ? "text-sm" : "text-base",
            )}
          >
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
          className={cn(
            "space-y-2 motion-safe:animate-reveal",
            section ? "pr-4 pb-3 pl-14" : "pr-3 pb-3 pl-15",
          )}
        >
          <p className="text-[13px] text-muted-foreground wrap-anywhere">
            {meta}
          </p>

          {change.reason && (
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm wrap-anywhere",
                section
                  ? sectionTone.reason
                  : "border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60",
              )}
            >
              {change.reason}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
