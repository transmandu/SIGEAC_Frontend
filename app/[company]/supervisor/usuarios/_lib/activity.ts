import type { TagTone } from "@/components/misc/TagBadge";
import type { PresenceStatus } from "@/hooks/notifications/useOnlineUsers";
import type { UserActivityRow } from "@/types/user-sessions";

/** Días sin usar el sistema a partir de los cuales una cuenta habilitada se marca. */
export const STALE_DAYS = 30;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const PRESENCE_META: Record<
  PresenceStatus,
  { label: string; tone: TagTone; dot: string }
> = {
  online: { label: "En línea", tone: "green", dot: "bg-emerald-500" },
  standby: {
    label: "En segundo plano",
    tone: "amber",
    dot: "bg-amber-500",
  },
  offline: { label: "Desconectado", tone: "slate", dot: "bg-slate-400" },
};

/** «hace 5 min», «hace 3 días»; sin dato, «Nunca». */
export function elapsedLabel(iso: string | null, now: Date): string {
  if (!iso) return "Nunca";

  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());

  if (diff < MINUTE) return "Hace un momento";
  if (diff < HOUR) return `Hace ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `Hace ${Math.floor(diff / HOUR)} h`;

  const days = Math.floor(diff / DAY);
  if (days < 60) return `Hace ${days} ${days === 1 ? "día" : "días"}`;

  return `Hace ${Math.floor(days / 30)} meses`;
}

export type AttentionKind =
  "disabled-with-session" | "multiple-sessions" | "never-signed-in" | "stale";

export interface Attention {
  kind: AttentionKind;
  tone: Extract<TagTone, "rose" | "amber" | "slate">;
  label: string;
}

/** Por qué una cuenta merece la mirada del supervisor; la primera razón que aplique. */
export function attentionOf(
  user: UserActivityRow,
  now: Date,
): Attention | null {
  if (!user.is_active && user.sessions.length > 0) {
    return {
      kind: "disabled-with-session",
      tone: "rose",
      label: "Cuenta deshabilitada con sesión abierta",
    };
  }

  if (!user.is_active) return null;

  if (user.sessions.length > 1) {
    return {
      kind: "multiple-sessions",
      tone: "amber",
      label: `${user.sessions.length} sesiones abiertas a la vez`,
    };
  }

  if (!user.last_used_at) {
    return {
      kind: "never-signed-in",
      tone: "slate",
      label: "Nunca ha ingresado",
    };
  }

  const idle = now.getTime() - new Date(user.last_used_at).getTime();

  if (idle > STALE_DAYS * DAY && user.presence === "offline") {
    return {
      kind: "stale",
      tone: "amber",
      label: `Sin actividad hace más de ${STALE_DAYS} días`,
    };
  }

  return null;
}

export interface Summary {
  total: number;
  online: number;
  standby: number;
  sessions: number;
  attention: number;
}

export function summarize(rows: UserActivityRow[], now: Date): Summary {
  return {
    total: rows.length,
    online: rows.filter((u) => u.is_active && u.presence === "online").length,
    standby: rows.filter((u) => u.is_active && u.presence === "standby").length,
    sessions: rows.reduce((sum, u) => sum + u.sessions.length, 0),
    attention: rows.filter((u) => attentionOf(u, now)).length,
  };
}

/** Dónde se administra la cuenta (datos, roles, activar/desactivar): no es de este panel. */
export const manageUserHref = (userId: number) =>
  `/sistema/usuarios_permisos/usuarios/${userId}`;

export const isConnected = (user: UserActivityRow) =>
  user.is_active && user.presence !== "offline";
