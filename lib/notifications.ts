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
  PackageOpen,
  PackageSearch,
  PackageX,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Undo2,
  Warehouse,
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

/**
 * Áreas por las que se puede filtrar la bandeja. Son las mismas que usa el
 * catálogo de Ajustes → Notificaciones in-app (Almacén, Compras, Operaciones,
 * SMS), más "Sistema" para los avisos técnicos que solo ve el superusuario.
 */
export type NotificationArea =
  "warehouse" | "purchasing" | "operations" | "sms" | "system";

export const NOTIFICATION_AREAS: Record<
  NotificationArea,
  { label: string; icon: LucideIcon }
> = {
  warehouse: { label: "Almacén", icon: Warehouse },
  purchasing: { label: "Compras", icon: ShoppingCart },
  operations: { label: "Operaciones", icon: PackageOpen },
  sms: { label: "SMS", icon: ShieldAlert },
  system: { label: "Sistema", icon: Server },
};

const AREA_ORDER: NotificationArea[] = [
  "warehouse",
  "purchasing",
  "operations",
  "sms",
  "system",
];

/** Avisos que no traen `data.type`: se reconocen por la clase que los envió. */
const AREA_BY_CLASS: Record<string, NotificationArea> = {
  ToolCalibrationAlert: "warehouse",
  RequisitionOrderNotification: "purchasing",
  CargoManifestIssuedAlert: "operations",
  CargoBillingPendingPaymentsAlert: "operations",
  SafetyReportCreatedNotification: "sms",
};

const AREA_BY_TYPE: [RegExp, NotificationArea][] = [
  [
    /^(ARTICLE_|DISPATCH_RETURN|ENGINEERING_CHECK|GENERAL_ARTICLE_INTAKE|INCOMING_BLOCKED|LOCATION_TRANSFER|QUARANTINE_)/,
    "warehouse",
  ],
  [/^(REQUISITION_|QUOTE_)/, "purchasing"],
  [/^(REPORTE_|TRAINING_)/, "sms"],
  [/^(MAIL_CHANNEL|REPLICA_|ERROR_REPORT)/, "system"],
];

/**
 * `null` = un aviso que aún no se clasificó: no se inventa un área, solo
 * queda fuera de los filtros por área (sigue en "Todas").
 */
export const notificationArea = (notification: {
  type?: string;
  data?: { type?: string };
}): NotificationArea | null => {
  const dataType = (notification.data?.type ?? "").toUpperCase();
  const byType = AREA_BY_TYPE.find(([pattern]) => pattern.test(dataType));
  if (byType) return byType[1];

  const className = (notification.type ?? "").split("\\").pop() ?? "";
  return AREA_BY_CLASS[className] ?? null;
};

export const NOTIFICATION_TONE_LABELS: Record<NotificationTone, string> = {
  rose: "Bloqueos y fallas",
  amber: "Recordatorios",
  emerald: "Resueltos",
  blue: "Informativos",
};

const TONE_ORDER: NotificationTone[] = ["rose", "amber", "emerald", "blue"];

export interface NotificationFacets {
  areas: { key: NotificationArea; count: number }[];
  tones: { key: NotificationTone; count: number }[];
}

/**
 * Qué hay de verdad en la bandeja. Las opciones salen de aquí y no de un
 * catálogo fijo: lo que la compañía no recibe (no tiene el módulo, no está en
 * esa audiencia) nunca aparece como filtro.
 */
export const notificationFacets = (
  notifications: {
    type?: string;
    data?: { type?: string };
  }[],
): NotificationFacets => {
  const areas = new Map<NotificationArea, number>();
  const tones = new Map<NotificationTone, number>();

  for (const notification of notifications) {
    const area = notificationArea(notification);
    if (area) areas.set(area, (areas.get(area) ?? 0) + 1);

    const tone = notificationTone(notification.data?.type);
    tones.set(tone, (tones.get(tone) ?? 0) + 1);
  }

  return {
    areas: AREA_ORDER.filter((key) => areas.has(key)).map((key) => ({
      key,
      count: areas.get(key) ?? 0,
    })),
    tones: TONE_ORDER.filter((key) => tones.has(key)).map((key) => ({
      key,
      count: tones.get(key) ?? 0,
    })),
  };
};

/** Estos roles ven y marcan sus avisos, pero no pueden vaciar la bandeja. */
const CLEAR_RESTRICTED_ROLES = ["ANALISTA_ALMACEN", "JEFE_ALMACEN"];

export const canClearNotifications = (
  roles?: { name: string }[] | null,
): boolean =>
  !roles?.some((role) => CLEAR_RESTRICTED_ROLES.includes(role.name));
