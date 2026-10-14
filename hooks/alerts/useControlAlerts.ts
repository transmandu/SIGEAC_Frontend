import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  CriticalAlertSourceKey,
  useCriticalAlertSources,
} from "./useCriticalAlertSources";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { useGetComponentControls } from "@/hooks/mantenimiento/planificacion/useGetComponentControls";
import { useGetAvionicsControls } from "@/hooks/mantenimiento/planificacion/useGetAvionicsControls";
import { useGetDirectiveControls } from "@/hooks/mantenimiento/planificacion/useGetDirectiveControls";
import { computeMaintenanceItem, fmtDate } from "@/lib/maintenanceControlCalc";
import { parseISO } from "date-fns";
import { COMPONENT_ACTION_LABELS } from "@/lib/componentControlLabels";
import { AVIONICS_ACTION_LABELS } from "@/lib/avionicsControlLabels";
import { DIRECTIVE_COMPLIANCE_TYPE_LABELS } from "@/lib/directiveControlLabels";
import {
  ComputedMaintenanceInterval,
  MaintenanceControlItemComputed,
} from "@/types";
import {
  ControlAlertType,
  CriticalAlert,
  MaintenanceWarningMeta,
} from "./types";

const STATUS_SEVERITY: Record<string, number> = {
  OK: 0,
  WARNING: 1,
  CRITICAL: 2,
  OVERDUE: 3,
};

/**
 * Mismo acceso que el ítem de menú de cada control (ver
 * lib/menus/planification.ts). Las listas tienen que moverse juntas — si el
 * menú abre el módulo a un rol que acá falta, ese usuario ve los vencimientos
 * en la pantalla pero nunca recibe la alerta crítica, que es de lo que vive
 * el módulo.
 */
const PLANIFICATION_ROLES = [
  "ANALISTA_PLANIFICACION",
  "JEFE_PLANIFICACION",
  "SUPERUSER",
];

const CONTROL_CONFIG: Record<
  ControlAlertType,
  { source: CriticalAlertSourceKey; route: string; roles: string[] }
> = {
  maintenance: {
    source: "maintenance_control",
    route: "control_mantenimiento",
    roles: PLANIFICATION_ROLES,
  },
  component: {
    source: "component_control",
    route: "control_componentes",
    roles: PLANIFICATION_ROLES,
  },
  avionics: {
    source: "avionics_control",
    route: "control_avionica",
    roles: PLANIFICATION_ROLES,
  },
  directive: {
    source: "directive_control",
    route: "control_directivas",
    roles: ["SUPERUSER"],
  },
};

const HREF_LABEL: Record<ControlAlertType, string> = {
  maintenance: "Ver control de mantenimiento",
  component: "Ver control de componentes",
  avionics: "Ver control de aviónica",
  directive: "Ver control de directivas",
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

/** Lo mínimo que la alerta necesita de un ítem, sea del control que sea. */
type AlertSubject = {
  control: ControlAlertType;
  controlId: number;
  /** Ítem (o tarea, en aviónica) que se evalúa. */
  id: number | undefined;
  aircraftAcronym: string;
  title: string;
  partName?: string | null;
  scopeLabel: string;
  item: Parameters<typeof computeMaintenanceItem>[0];
  computed: MaintenanceControlItemComputed | null | undefined;
};

function buildMeta(
  subject: AlertSubject,
  status: MaintenanceWarningMeta["status"],
): MaintenanceWarningMeta | undefined {
  const interval = worstInterval(subject.computed?.intervals ?? []);
  if (!interval || interval.remaining_value === null) return undefined;

  const limitValue = Number(interval.limit_value);
  const remainingValue = interval.remaining_value;
  const consumed =
    limitValue > 0
      ? Math.min(Math.max((limitValue - remainingValue) / limitValue, 0), 1)
      : 0;

  const estimateDate =
    interval.counting_method === "DAYS"
      ? interval.next_date
      : interval.estimate_date;

  return {
    status,
    control: subject.control,
    scopeLabel: subject.scopeLabel,
    unit: interval.counting_method,
    remainingValue,
    estimate: estimateDate ? fmtDate(parseISO(estimateDate)) : null,
    progress: consumed,
    aircraftAcronym: subject.aircraftAcronym,
  };
}

const SOURCE_ID: Record<ControlAlertType, string> = {
  maintenance: "maintenance-control-item",
  component: "component-control-item",
  avionics: "avionics-control-task",
  directive: "directive-control-item",
};

function toAlert(
  subject: AlertSubject,
  companySlug: string | undefined,
): CriticalAlert | null {
  const { status } = computeMaintenanceItem(subject.item);

  if (status !== "WARNING" && status !== "CRITICAL" && status !== "OVERDUE") {
    return null;
  }

  // Sin datos para dibujar la tarjeta (el intervalo no trae remanente) no hay
  // alerta: emitirla la contaría en la campana sin mostrar nada.
  const maintenanceMeta = buildMeta(subject, status);
  if (!maintenanceMeta) return null;

  const config = CONTROL_CONFIG[subject.control];

  return {
    // El prefijo por control mantiene los ids únicos: un ítem de componentes
    // y uno de mantenimiento pueden compartir número.
    id: `${SOURCE_ID[subject.control]}-${subject.id}`,
    source: SOURCE_ID[subject.control],
    sourceId: subject.id ?? 0,
    variant: "maintenance-warning",
    tone: "maintenance",
    // Vencido pesa más que crítico, y este más que la alerta temprana,
    // igual que en el resto de fuentes.
    weight: status === "OVERDUE" ? 150 : status === "CRITICAL" ? 90 : 40,
    // El plazo corre igual aunque se oculte el aviso.
    isDismissable: false,
    title: subject.title,
    label: [subject.aircraftAcronym, subject.partName]
      .filter(Boolean)
      .join(" · "),
    severity: status === "OVERDUE" ? "critical" : "warning",
    href: companySlug
      ? `/${companySlug}/planificacion/${config.route}/${subject.controlId}`
      : undefined,
    hrefLabel: HREF_LABEL[subject.control],
    maintenanceMeta,
  } satisfies CriticalAlert;
}

/**
 * Vencimientos de los cuatro controles de planificación (mantenimiento,
 * componentes, aviónica y directivas) en estado ALERTA TEMPRANA, CRÍTICO o
 * VENCIDO. La clasificación reutiliza lib/maintenanceControlCalc.ts —la misma
 * regla que dibuja el estado en el detalle de cada control— para que la
 * alerta nunca diverja de lo que esa pantalla ya muestra. Los cuatro
 * comparten la tarjeta "maintenance-warning"; la tarjeta rotula de qué
 * control viene cada ítem.
 */
export const useControlAlerts = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const { hasSource } = useCriticalAlertSources();

  // `hasSource` pregunta si el módulo está montado de verdad; `isOMAC` solo
  // dice qué TIPO de empresa es, y hay empresas OMAC sin estos módulos.
  const canSee = useMemo(() => {
    const roles = (user?.roles ?? []).map((r) => r.name);
    return (Object.keys(CONTROL_CONFIG) as ControlAlertType[]).reduce(
      (acc, control) => {
        const config = CONTROL_CONFIG[control];
        acc[control] =
          hasSource(config.source) &&
          roles.some((role) => config.roles.includes(role));
        return acc;
      },
      {} as Record<ControlAlertType, boolean>,
    );
  }, [hasSource, user?.roles]);

  // Los listados omiten la fecha estimada salvo que se pida (cuesta una
  // consulta de vuelos por control), y la tarjeta la muestra.
  const maintenance = useGetMaintenanceControls(
    canSee.maintenance ? companySlug : undefined,
    false,
    true,
  );
  const component = useGetComponentControls(
    canSee.component ? companySlug : undefined,
    false,
    true,
  );
  const avionics = useGetAvionicsControls(
    canSee.avionics ? companySlug : undefined,
    false,
    true,
  );
  const directive = useGetDirectiveControls(
    canSee.directive ? companySlug : undefined,
    false,
    true,
  );

  const alerts = useMemo<CriticalAlert[]>(() => {
    const subjects: AlertSubject[] = [];

    if (canSee.maintenance) {
      for (const control of maintenance.data ?? []) {
        if (!control.aircraft) continue;
        for (const item of control.items ?? []) {
          if (item.retired_at) continue;
          subjects.push({
            control: "maintenance",
            controlId: control.id,
            id: item.id,
            aircraftAcronym: control.aircraft.acronym,
            title: item.description,
            partName: item.aircraft_part?.part_name,
            scopeLabel: maintenanceScope(item),
            item,
            computed: item.computed,
          });
        }
      }
    }

    if (canSee.component) {
      for (const control of component.data ?? []) {
        if (!control.aircraft) continue;
        for (const item of control.items ?? []) {
          if (item.retired_at) continue;
          subjects.push({
            control: "component",
            controlId: control.id,
            id: item.id,
            aircraftAcronym: control.aircraft.acronym,
            title: item.description,
            partName: item.aircraft_part?.part_name,
            scopeLabel: COMPONENT_ACTION_LABELS[item.action] ?? item.action,
            item,
            computed: item.computed,
          });
        }
      }
    }

    if (canSee.avionics) {
      for (const control of avionics.data ?? []) {
        if (!control.aircraft) continue;
        for (const item of control.items ?? []) {
          if (item.retired_at) continue;
          for (const task of item.tasks ?? []) {
            if (task.retired_at || task.is_on_condition) continue;
            subjects.push({
              control: "avionics",
              controlId: control.id,
              id: task.id,
              aircraftAcronym: control.aircraft.acronym,
              title: item.description,
              partName: item.aircraft_part?.part_name,
              scopeLabel: AVIONICS_ACTION_LABELS[task.action] ?? task.action,
              item: task,
              computed: task.computed,
            });
          }
        }
      }
    }

    if (canSee.directive) {
      for (const control of directive.data ?? []) {
        if (!control.aircraft) continue;
        for (const item of control.items ?? []) {
          if (item.retired_at) continue;
          subjects.push({
            control: "directive",
            controlId: control.id,
            id: item.id,
            aircraftAcronym: control.aircraft.acronym,
            title: `${item.ad_number} · ${item.description}`,
            partName: item.aircraft_part?.part_name,
            scopeLabel:
              DIRECTIVE_COMPLIANCE_TYPE_LABELS[item.compliance_type] ??
              item.compliance_type,
            item,
            computed: item.computed,
          });
        }
      }
    }

    return subjects
      .map((subject) => toAlert(subject, companySlug))
      .filter((alert): alert is CriticalAlert => alert !== null);
  }, [
    canSee,
    maintenance.data,
    component.data,
    avionics.data,
    directive.data,
    companySlug,
  ]);

  return {
    alerts,
    isLoading:
      (canSee.maintenance && maintenance.isLoading) ||
      (canSee.component && component.isLoading) ||
      (canSee.avionics && avionics.isLoading) ||
      (canSee.directive && directive.isLoading),
  };
};

function maintenanceScope(item: {
  item_type: "CERTIFICATE" | "SERVICE";
  aircraft_part?: unknown;
}): string {
  if (item.aircraft_part) {
    return item.item_type === "CERTIFICATE"
      ? "Certificado de parte"
      : "Servicio de parte";
  }
  return item.item_type === "CERTIFICATE"
    ? "Certificado de aeronave"
    : "Servicio de aeronave";
}
