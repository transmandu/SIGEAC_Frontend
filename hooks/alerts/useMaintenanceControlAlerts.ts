import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useIsOmac } from "@/hooks/sistema/useIsOmac";
import { useGetMaintenanceControls } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceControls";
import { computeMaintenanceItem } from "@/lib/maintenanceControlCalc";
import { MaintenanceControl, MaintenanceControlItem } from "@/types";
import { CriticalAlert } from "./types";

/**
 * Mismo acceso que el ítem de menú de Control de Mantenimiento (módulo aún
 * en desarrollo, ver lib/menus/planification.ts): solo SUPERUSER, y solo en
 * empresas OMAC. Se ensancha el día que el módulo se libere a más roles.
 */
const ROLES_WITH_MAINTENANCE_CONTROL_ALERT_ACCESS = ["SUPERUSER"];

/**
 * Vencimientos de Control de Mantenimiento en estado CRÍTICO o VENCIDO. La
 * clasificación reutiliza lib/maintenanceControlCalc.ts —la misma regla que
 * dibuja el estado en el detalle del control— para que la alerta nunca
 * diverja de lo que esa pantalla ya muestra.
 */
export const useMaintenanceControlAlerts = () => {
    const { user } = useAuth();
    const { selectedCompany } = useCompanyStore();
    const companySlug = selectedCompany?.slug;

    const { data: isOmac } = useIsOmac(companySlug);

    const canSeeMaintenanceControlAlerts = useMemo(
        () =>
            !!isOmac
            && (user?.roles ?? []).some((r) => ROLES_WITH_MAINTENANCE_CONTROL_ALERT_ACCESS.includes(r.name)),
        [isOmac, user?.roles],
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
                const currentValue = item.maintenance_control_part?.aircraft_part
                    ? {
                        flight_hours: item.maintenance_control_part.aircraft_part.time_since_new ?? 0,
                        flight_cycles: item.maintenance_control_part.aircraft_part.cycles_since_new ?? 0,
                    }
                    : { flight_hours: aircraft.flight_hours, flight_cycles: aircraft.flight_cycles };

                const computed = computeMaintenanceItem(
                    item as MaintenanceControlItem,
                    currentValue,
                    undefined,
                    Number(control.remaining_percentage ?? 10),
                );

                if (computed.status !== "CRITICAL" && computed.status !== "OVERDUE") continue;

                const partLabel = item.maintenance_control_part?.aircraft_part?.part_name;

                result.push({
                    id: `maintenance-control-item-${item.id}`,
                    source: "maintenance-control-item",
                    sourceId: item.id ?? 0,
                    tone: "maintenance",
                    // Vencido pesa más que crítico, igual que en el resto de fuentes.
                    weight: computed.status === "OVERDUE" ? 150 : 90,
                    // El plazo de mantenimiento corre igual aunque se oculte el aviso.
                    isDismissable: false,
                    title: computed.status === "OVERDUE"
                        ? `Vencido: ${item.name}`
                        : `Por vencer: ${item.name}`,
                    label: [aircraft.acronym, partLabel].filter(Boolean).join(" · "),
                    description: `Frecuencia: ${computed.frequency} · Remanente: ${computed.remaining}`,
                    severity: computed.status === "OVERDUE" ? "critical" : "warning",
                    href: companySlug ? `/${companySlug}/planificacion/control_mantenimiento/${control.id}` : undefined,
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
