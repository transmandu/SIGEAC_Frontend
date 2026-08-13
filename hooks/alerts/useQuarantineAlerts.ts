import { useAuth } from "@/contexts/AuthContext";
import { useGetQuarantineArticles } from "@/hooks/mantenimiento/control_calidad/useGetQuarantineArticles";
import { quarantineRisk } from "@/lib/warehouse/quarantine";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMemo } from "react";
import { useQuarantineLegalDays } from "@/hooks/general/useCompanySettings";
import { CriticalAlert } from "./types";

/**
 * Corregir un artículo retenido es trabajo de compras aeronáuticas; el
 * SUPERUSER entra por supervisión. Espeja las de
 * QuarantineNotificationService: quien recibe el correo es quien ve la alerta.
 */
const ROLES_WITH_QUARANTINE_ALERT_ACCESS = [
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "SUPERUSER",
];

/**
 * Alerta por artículo retenido esperando corrección. A diferencia de la de bajo
 * stock no trae acción directa: resolver exige editar el artículo o su
 * documentación, que no cabe en un popover, así que la tarjeta informa y enlaza
 * al submódulo.
 */
export const useQuarantineAlerts = () => {
    const { user } = useAuth();
    const { selectedCompany } = useCompanyStore();
    const legalDays = useQuarantineLegalDays();

    const canSeeQuarantineAlerts = useMemo(
        () => (user?.roles ?? []).some((r) => ROLES_WITH_QUARANTINE_ALERT_ACCESS.includes(r.name)),
        [user?.roles],
    );

    // Solo lo que espera corrección: un artículo ya enviado a re-inspección no
    // está en manos de compras y alertarlo sería ruido.
    const { data, isLoading } = useGetQuarantineArticles(
        canSeeQuarantineAlerts ? "OPEN" : "ALL",
    );

    const records = useMemo(
        () => (canSeeQuarantineAlerts ? (data ?? []) : []),
        [canSeeQuarantineAlerts, data],
    );

    const alerts = useMemo<CriticalAlert[]>(() => {
        const companySlug = selectedCompany?.slug;

        return records.map((record) => {
            const risk = quarantineRisk(
                record.quarantine_entry_date,
                legalDays,
                record.days_in_quarantine,
            );

            const articleLabel = [
                record.article?.part_number,
                record.article?.batch?.name,
                record.article?.serial ? `S/N ${record.article.serial}` : null,
            ]
                .filter(Boolean)
                .join(" - ");

            const attempts = record.cycles?.length ?? 0;

            const timeLine = risk.remaining === null
                ? `${record.days_in_quarantine ?? 0} día(s) retenido`
                : risk.remaining >= 0
                    ? `${record.days_in_quarantine ?? 0} de ${legalDays} días · restan ${risk.remaining}`
                    : `${record.days_in_quarantine ?? 0} de ${legalDays} días · vencido por ${Math.abs(risk.remaining)}`;

            const reasonLine = `Motivo: ${record.reason}`;
            const recurrenceLine = attempts > 1
                ? `\nYa se corrigió ${attempts - 1} vez/veces sin superar la re-inspección.`
                : "";

            return {
                id: `quarantine-article-${record.id}`,
                source: "quarantine-article",
                sourceId: record.id,
                title: record.is_overdue
                    ? "Artículo en cuarentena con el plazo legal vencido"
                    : "Un artículo en cuarentena espera corrección de compras",
                label: articleLabel,
                description: `${timeLine}\n${reasonLine}${recurrenceLine}`,
                // Lo vencido es exposición ante el ente, no solo urgencia interna.
                severity: record.is_overdue ? "critical" : "warning",
                href: companySlug ? `/${companySlug}/compras/cuarentena` : undefined,
                hrefLabel: "Ver cuarentena",
            } satisfies CriticalAlert;
        });
    }, [records, selectedCompany?.slug, legalDays]);

    return {
        alerts,
        isLoading: canSeeQuarantineAlerts && isLoading,
    };
};
