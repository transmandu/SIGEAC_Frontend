import {
  Biohazard,
  ClipboardCheck,
  PackageMinus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  alertVariant,
  type ControlAlertType,
  type CriticalAlert,
  type MaintenanceWarningMeta,
} from "./types";

/**
 * Las alertas se agrupan por lo que SON, no por la fuente que las calculó: a
 * quien ve varias a la vez (el superusuario ve todas las que están activas) le
 * sirve separar "lo del almacén" de "lo de los controles", no saber cuántos
 * hooks hay detrás.
 */
export type AlertCategory = "stock" | "quarantine" | "control" | "report";

export const ALERT_CATEGORIES: Record<
  AlertCategory,
  { label: string; icon: LucideIcon }
> = {
  stock: { label: "Stock", icon: PackageMinus },
  quarantine: { label: "Cuarentena", icon: Biohazard },
  control: { label: "Controles", icon: Wrench },
  report: { label: "Informes", icon: ClipboardCheck },
};

/** Orden en el que se ofrecen: el mismo en que el panel suele apilarlas. */
const CATEGORY_ORDER: AlertCategory[] = [
  "control",
  "quarantine",
  "stock",
  "report",
];

export const alertCategory = (alert: CriticalAlert): AlertCategory => {
  const variant = alertVariant(alert);

  if (variant === "quarantine-hazard") return "quarantine";
  if (variant === "maintenance-warning") return "control";
  if (alert.source.startsWith("low-stock")) return "stock";

  return "report";
};

export const CONTROL_LABELS: Record<ControlAlertType, string> = {
  maintenance: "Mantenimiento",
  component: "Componentes",
  avionics: "Aviónica",
  directive: "Directivas",
};

export const CONTROL_STATUS_LABELS: Record<
  MaintenanceWarningMeta["status"],
  string
> = {
  OVERDUE: "Vencidos",
  CRITICAL: "Críticos",
  WARNING: "Alerta temprana",
};

/** De más grave a menos: así se listan en el selector. */
const STATUS_ORDER: MaintenanceWarningMeta["status"][] = [
  "OVERDUE",
  "CRITICAL",
  "WARNING",
];

export const ALL = "all" as const;

/**
 * `aircraft`, `control` y `status` solo se aplican a las alertas de los
 * controles y solo se ofrecen cuando se mira esa categoría: filtrar por
 * aeronave dejando a la vista las de stock sería una mezcla sin sentido.
 */
export interface AlertFilters {
  category: AlertCategory | typeof ALL;
  aircraft: string | typeof ALL;
  control: ControlAlertType | typeof ALL;
  status: MaintenanceWarningMeta["status"] | typeof ALL;
}

export const NO_ALERT_FILTERS: AlertFilters = {
  category: ALL,
  aircraft: ALL,
  control: ALL,
  status: ALL,
};

export interface AlertFacets {
  categories: { key: AlertCategory; count: number }[];
  aircraft: string[];
  controls: { key: ControlAlertType; count: number }[];
  statuses: { key: MaintenanceWarningMeta["status"]; count: number }[];
}

/**
 * Lo que de verdad hay para filtrar. Se calcula sobre lo que el panel muestra
 * y no sobre un catálogo: una empresa sin almacén general o un usuario que no
 * ve cuarentena nunca verá esas opciones, y un filtro sin nada que separar
 * (una sola categoría) ni siquiera se dibuja.
 */
export const alertFacets = (alerts: CriticalAlert[]): AlertFacets => {
  const categories = new Map<AlertCategory, number>();
  const aircraft = new Set<string>();
  const controls = new Map<ControlAlertType, number>();
  const statuses = new Map<MaintenanceWarningMeta["status"], number>();

  for (const alert of alerts) {
    const category = alertCategory(alert);
    categories.set(category, (categories.get(category) ?? 0) + 1);

    const meta = alert.maintenanceMeta;
    if (category !== "control" || !meta) continue;

    if (meta.aircraftAcronym) aircraft.add(meta.aircraftAcronym);
    controls.set(meta.control, (controls.get(meta.control) ?? 0) + 1);
    statuses.set(meta.status, (statuses.get(meta.status) ?? 0) + 1);
  }

  return {
    categories: CATEGORY_ORDER.filter((key) => categories.has(key)).map(
      (key) => ({ key, count: categories.get(key) ?? 0 }),
    ),
    aircraft: [...aircraft].sort((a, b) => a.localeCompare(b, "es")),
    controls: (Object.keys(CONTROL_LABELS) as ControlAlertType[])
      .filter((key) => controls.has(key))
      .map((key) => ({ key, count: controls.get(key) ?? 0 })),
    statuses: STATUS_ORDER.filter((key) => statuses.has(key)).map((key) => ({
      key,
      count: statuses.get(key) ?? 0,
    })),
  };
};

/**
 * Una selección puede quedar huérfana (se atendió la última alerta de esa
 * categoría, se apagó una desde Ajustes): en vez de dejar el panel vacío con un
 * filtro invisible, vuelve a "todas".
 */
export const resolveAlertFilters = (
  filters: AlertFilters,
  facets: AlertFacets,
): AlertFilters => {
  const category =
    filters.category !== ALL &&
    facets.categories.some((item) => item.key === filters.category)
      ? filters.category
      : ALL;

  if (category !== "control") {
    return { ...NO_ALERT_FILTERS, category };
  }

  return {
    category,
    aircraft: facets.aircraft.includes(filters.aircraft)
      ? filters.aircraft
      : ALL,
    control: facets.controls.some((item) => item.key === filters.control)
      ? filters.control
      : ALL,
    status: facets.statuses.some((item) => item.key === filters.status)
      ? filters.status
      : ALL,
  };
};

export const applyAlertFilters = (
  alerts: CriticalAlert[],
  filters: AlertFilters,
): CriticalAlert[] => {
  if (filters.category === ALL) return alerts;

  return alerts.filter((alert) => {
    if (alertCategory(alert) !== filters.category) return false;
    if (filters.category !== "control") return true;

    const meta = alert.maintenanceMeta;
    if (!meta) return false;

    return (
      (filters.aircraft === ALL || meta.aircraftAcronym === filters.aircraft) &&
      (filters.control === ALL || meta.control === filters.control) &&
      (filters.status === ALL || meta.status === filters.status)
    );
  });
};
