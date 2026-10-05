import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useCriticalAlertSources } from "./useCriticalAlertSources";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { computeMaintenanceItem } from "@/lib/maintenanceControlCalc";
import {
  ComputedMaintenanceInterval,
  MaintenanceControl,
  MaintenanceControlItem,
} from "@/types";
import { CriticalAlert, MaintenanceWarningMeta } from "./types";

const STATUS_SEVERITY: Record<string, number> = {
  OK: 0,
  WARNING: 1,
  CRITICAL: 2,
  OVERDUE: 3,
};

/**
 * El intervalo que causó el status del ítem: mismo criterio "el peor manda"
 * que MaintenanceControlCalculator::worse() en el backend. Se usa para tomar
 * el objetivo/remanente/progreso a mostrar cuando el ítem tiene más de un
 * intervalo ("lo que ocurra primero").
 */
function worstInterval(
  intervals: ComputedMaintenanceInterval[],
): ComputedMaintenanceInterval | undefined {
  return intervals
    .filter((interval) => interval.status !== null)
    .reduce<ComputedMaintenanceInterval | undefined>((worst, interval) => {
      if (!worst) return interval;
      return (STATUS_SEVERITY[interval.status!] ?? -1) >
        (STATUS_SEVERITY[worst.status!] ?? -1)
        ? interval
        : worst;
    }, undefined);
}

function buildMaintenanceWarningMeta(
  item: MaintenanceControlItem,
  aircraftAcronym: string,
): MaintenanceWarningMeta | undefined {
  const intervals = item.computed?.intervals ?? [];
  const interval = worstInterval(intervals);
  if (!interval || interval.remaining_value === null) return undefined;

  const limitValue = Number(interval.limit_value);
  const remainingValue = interval.remaining_value;
  const consumed =
    limitValue > 0
      ? Math.min(Math.max((limitValue - remainingValue) / limitValue, 0), 1)
      : 0;

  const part = item.maintenance_control_part?.aircraft_part;

  return {
    category: item.category,
    scope: part ? "part" : "aircraft",
    partLabel: part?.part_name,
    unit: interval.counting_method,
    limitValue,
    remainingValue,
    progress: consumed,
    aircraftAcronym,
  };
}

/**
 * Mismo acceso que el ítem de menú de Control de Mantenimiento (ver
 * lib/menus/planification.ts): estos roles, y solo en empresas OMAC. Las dos
 * listas tienen que moverse juntas — si el menú abre el módulo a un rol que
 * acá falta, ese usuario ve los vencimientos en la pantalla pero nunca recibe
 * la alerta crítica, que es de lo que vive el módulo.
 */
const ROLES_WITH_MAINTENANCE_CONTROL_ALERT_ACCESS = [
  "ANALISTA_PLANIFICACION",
  "JEFE_PLANIFICACION",
  "SUPERUSER",
];

/**
 * Vencimientos de Control de Mantenimiento en estado ALERTA TEMPRANA,
 * CRÍTICO o VENCIDO. La clasificación reutiliza lib/maintenanceControlCalc.ts
 * —la misma regla que dibuja el estado en el detalle del control— para que la
 * alerta nunca diverja de lo que esa pantalla ya muestra. WARNING usa su
 * propia tarjeta (variant "maintenance-warning"); CRITICAL/OVERDUE siguen en
 * la tarjeta genérica de stock, sin cambios de diseño.
 */
export const useMaintenanceControlAlerts = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const { hasSource } = useCriticalAlertSources();

  // Antes esto miraba `isOMAC`, que dice qué TIPO de empresa es y no si el
  // módulo está montado: hay empresas OMAC sin Control de Mantenimiento, y
  // ahí la alerta pedía contra tablas inexistentes. El backend confirma que
  // la fuente existe de verdad.
  const canSeeMaintenanceControlAlerts = useMemo(
    () =>
      hasSource("maintenance_control") &&
      (user?.roles ?? []).some((r) =>
        ROLES_WITH_MAINTENANCE_CONTROL_ALERT_ACCESS.includes(r.name),
      ),
    [hasSource, user?.roles],
  );

  const { data, isLoading } = useGetMaintenanceControls(
    canSeeMaintenanceControlAlerts ? companySlug : undefined,
  );

  const controls = useMemo(
    () => (canSeeMaintenanceControlAlerts ? (data ?? []) : []),
    [canSeeMaintenanceControlAlerts, data],
  );

  const alerts = useMemo<CriticalAlert[]>(() => {
    const result: CriticalAlert[] = [];

    for (const control of controls as MaintenanceControl[]) {
      const aircraft = control.aircraft;
      if (!aircraft) continue;

      for (const item of control.items ?? []) {
        const computed = computeMaintenanceItem(item);

        if (
          computed.status !== "CRITICAL" &&
          computed.status !== "OVERDUE" &&
          computed.status !== "WARNING"
        )
          continue;

        const partLabel =
          item.maintenance_control_part?.aircraft_part?.part_name;

        if (computed.status === "WARNING") {
          result.push({
            id: `maintenance-control-item-${item.id}`,
            source: "maintenance-control-item",
            sourceId: item.id ?? 0,
            variant: "maintenance-warning",
            tone: "maintenance",
            // Por debajo de CRITICAL(90)/OVERDUE(150): es la fuente
            // menos urgente de mantenimiento en la lista.
            weight: 40,
            // El plazo corre igual aunque se oculte el aviso.
            isDismissable: false,
            title: item.name,
            label: [aircraft.acronym, partLabel].filter(Boolean).join(" · "),
            severity: "warning",
            href: companySlug
              ? `/${companySlug}/planificacion/control_mantenimiento/${control.id}`
              : undefined,
            hrefLabel: "Ver control de mantenimiento",
            maintenanceMeta: buildMaintenanceWarningMeta(
              item,
              aircraft.acronym,
            ),
          } satisfies CriticalAlert);
          continue;
        }

        result.push({
          id: `maintenance-control-item-${item.id}`,
          source: "maintenance-control-item",
          sourceId: item.id ?? 0,
          tone: "maintenance",
          // Vencido pesa más que crítico, igual que en el resto de fuentes.
          weight: computed.status === "OVERDUE" ? 150 : 90,
          // El plazo de mantenimiento corre igual aunque se oculte el aviso.
          isDismissable: false,
          title:
            computed.status === "OVERDUE"
              ? `Vencido: ${item.name}`
              : `Por vencer: ${item.name}`,
          label: [aircraft.acronym, partLabel].filter(Boolean).join(" · "),
          description: `Frecuencia: ${computed.frequency} · Remanente: ${computed.remaining}`,
          severity: computed.status === "OVERDUE" ? "critical" : "warning",
          href: companySlug
            ? `/${companySlug}/planificacion/control_mantenimiento/${control.id}`
            : undefined,
          hrefLabel: "Ver control de mantenimiento",
        } satisfies CriticalAlert);
      }
    }

    return result;
  }, [controls, companySlug]);

  return {
    alerts,
    isLoading: canSeeMaintenanceControlAlerts && isLoading,
  };
};
