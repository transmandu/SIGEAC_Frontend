import {
  Bell,
  BellRing,
  Bug,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  DatabaseBackup,
  DatabaseZap,
  FileClock,
  FilePenLine,
  FileText,
  FileWarning,
  FileX,
  Flag,
  MailWarning,
  PackagePlus,
  PackageSearch,
  PackageX,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Undo2,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";

import type { TagTone } from "@/components/misc/TagBadge";

/**
 * El backend manda el nombre del icono en `data.icon`. Un mapa explícito en vez
 * de `import * as Lucide`: esto último mete la librería entera de iconos en el
 * paquete de la campana, que está en todas las pantallas. Un nombre que no esté
 * aquí cae a la campana; al estrenar un icono en el backend se agrega abajo.
 */
const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  BadgeDollarSign,
  Bell,
  BellRing,
  Bug,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  DatabaseBackup,
  DatabaseZap,
  FileClock,
  FilePenLine,
  FileText,
  FileWarning,
  FileX,
  Flag,
  MailWarning,
  PackagePlus,
  // El backend lo manda con este nombre, que lucide no tiene: se muestra el
  // equivalente en vez de caer a la campana.
  PackageQuestion: PackageSearch,
  PackageSearch,
  PackageX,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Undo2,
};

export const notificationIcon = (name?: string): LucideIcon =>
  NOTIFICATION_ICONS[name ?? ""] ?? Bell;

export type NotificationTone = Extract<
  TagTone,
  "blue" | "rose" | "amber" | "emerald"
>;

/**
 * El color dice qué clase de aviso es, no es decorativo: rojo lo que bloquea o
 * falla, ámbar lo que recuerda o está por vencer, verde lo que se resolvió y
 * azul todo lo demás. Se deduce del tipo (`REQUISITION_CREATED`, …).
 */
export const notificationTone = (type?: string): NotificationTone => {
  const value = (type ?? "").toUpperCase();

  if (
    /BLOCKED|OUT_OF_SYNC|_DOWN|REJECTED|QUARANTINED|DISCARDED|ERROR_REPORT_SUBMITTED/.test(
      value,
    )
  ) {
    return "rose";
  }

  if (/REMINDER|EXPIRING|STALE|TO_DETERMINATE|PRIORITY_CHANGED/.test(value)) {
    return "amber";
  }

  if (/RESOLVED|RESYNCED|READY_FOR/.test(value)) return "emerald";

  return "blue";
};

export const NOTIFICATION_TONE_STYLES: Record<
  NotificationTone,
  { stripe: string; icon: string; unread: string }
> = {
  blue: {
    stripe: "bg-blue-500",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    unread: "bg-blue-50/70 dark:bg-blue-500/6",
  },
  rose: {
    stripe: "bg-rose-500",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    unread: "bg-rose-50/70 dark:bg-rose-500/6",
  },
  amber: {
    stripe: "bg-amber-500",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    unread: "bg-amber-50/70 dark:bg-amber-500/6",
  },
  emerald: {
    stripe: "bg-emerald-500",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    unread: "bg-emerald-50/70 dark:bg-emerald-500/6",
  },
};

/** Estos roles ven y marcan sus avisos, pero no pueden vaciar la bandeja. */
const CLEAR_RESTRICTED_ROLES = ["ANALISTA_ALMACEN", "JEFE_ALMACEN"];

export const canClearNotifications = (
  roles?: { name: string }[] | null,
): boolean =>
  !roles?.some((role) => CLEAR_RESTRICTED_ROLES.includes(role.name));
