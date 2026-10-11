"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDepartmentAuditLogs,
  useGetDepartmentHistory,
} from "@/hooks/ajustes/departamento/useGetDepartmentHistory";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Department } from "@/types";
import {
  ArrowRightLeft,
  Briefcase,
  GitMerge,
  LogIn,
  LogOut,
  MapPin,
  MoveRight,
  Pencil,
  Plus,
  Power,
  Tag,
  Trash2,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type Event = {
  key: string;
  at: string;
  icon: LucideIcon;
  title: string;
  detail?: string | null;
  by?: string;
  tone: string;
};

const NEUTRAL = "bg-muted text-muted-foreground";
const POSITIVE = "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400";
const WARNING = "bg-amber-500/14 text-amber-600 dark:text-amber-400";
const DANGER = "bg-rose-500/12 text-rose-600 dark:text-rose-400";
const INFO = "bg-blue-500/12 text-blue-600 dark:text-blue-400";

const AUDIT: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  CREATED: { label: "Departamento creado", icon: Plus, tone: POSITIVE },
  RENAMED: { label: "Datos modificados", icon: Pencil, tone: INFO },
  RETYPED: { label: "Tipo cambiado", icon: Tag, tone: INFO },
  MOVED: { label: "Movido en el organigrama", icon: MoveRight, tone: INFO },
  REORDERED: { label: "Reordenado entre sus hermanos", icon: ArrowRightLeft, tone: NEUTRAL },
  ACTIVATED: { label: "Activado", icon: Power, tone: POSITIVE },
  DEACTIVATED: { label: "Desactivado", icon: Power, tone: WARNING },
  DELETED: { label: "Eliminado", icon: Trash2, tone: DANGER },
  LOCATIONS_CHANGED: { label: "Sedes o correos modificados", icon: MapPin, tone: INFO },
  MERGED: { label: "Fusión de departamentos", icon: GitMerge, tone: WARNING },
};

const MOVEMENT: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  INGRESO: { label: "Ingreso", icon: UserPlus, tone: POSITIVE },
  REINGRESO: { label: "Reingreso", icon: LogIn, tone: POSITIVE },
  TRASLADO: { label: "Traslado", icon: ArrowRightLeft, tone: INFO },
  CAMBIO_CARGO: { label: "Cambio de cargo", icon: Briefcase, tone: INFO },
  RETIRO: { label: "Retiro", icon: LogOut, tone: DANGER },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function Timeline({ events, empty }: { events: Event[]; empty: string }) {
  if (!events.length) {
    return <p className="text-muted-foreground bg-muted/40 rounded-xl px-3 py-5 text-center text-sm">{empty}</p>;
  }

  return (
    <ol className="relative space-y-4">
      <span aria-hidden className="bg-border absolute top-2 bottom-2 left-4.5 w-px" />

      {events.map(({ key, at, icon: EventIcon, title, detail, by, tone }) => (
        <li key={key} className="relative flex gap-3">
          <span
            className={cn(
              "ring-background relative z-10 grid size-9 shrink-0 place-content-center rounded-full ring-4",
              tone,
            )}
          >
            <EventIcon className="size-4" />
          </span>

          <div className="min-w-0 pt-0.5">
            <p className="text-sm leading-tight font-medium">{title}</p>
            {detail && <p className="text-muted-foreground mt-0.5 text-sm">{detail}</p>}
            <p className="text-muted-foreground mt-0.5 text-xs">
              {formatDate(at)}
              {by && ` · ${by}`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DepartmentHistoryTab({ department }: { department: Department }) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const { data: logs, isLoading: loadingLogs } = useGetDepartmentAuditLogs(slug, department.id);
  const { data: history, isLoading: loadingHistory } = useGetDepartmentHistory(slug, department.id);

  if (loadingLogs || loadingHistory) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    );
  }

  const changes: Event[] = (logs ?? []).map((log) => {
    const meta = AUDIT[log.action] ?? { label: log.action, icon: Pencil, tone: NEUTRAL };

    return {
      key: `log-${log.id}`,
      at: log.created_at,
      icon: meta.icon,
      title: meta.label,
      detail: log.reason,
      by: log.performed_by,
      tone: meta.tone,
    };
  });

  const people: Event[] = (history ?? []).flatMap((entry) => {
    const name = [entry.employee?.first_name, entry.employee?.last_name].filter(Boolean).join(" ");
    const opened = MOVEMENT[entry.movement_type];
    const events: Event[] = [
      {
        key: `in-${entry.id}`,
        at: entry.started_at,
        icon: opened.icon,
        title: `${opened.label} · ${name}`,
        detail: entry.reason,
        by: entry.registered_by,
        tone: opened.tone,
      },
    ];

    if (entry.ended_at && entry.end_type) {
      const closed = MOVEMENT[entry.end_type];

      events.push({
        key: `out-${entry.id}`,
        at: entry.ended_at,
        icon: closed.icon,
        title: `${closed.label} · ${name}`,
        detail: entry.end_reason,
        tone: closed.tone,
      });
    }

    return events;
  });

  people.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Cambios del departamento
        </h3>
        <Timeline events={changes} empty="Sin cambios registrados." />
      </section>

      <section className="space-y-3">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Ingresos y retiros del personal
        </h3>
        <Timeline events={people} empty="Sin movimientos de personal." />
      </section>
    </div>
  );
}
