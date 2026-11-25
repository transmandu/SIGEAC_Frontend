import { useGetQuarantineArticles } from "@/hooks/mantenimiento/control_calidad/useGetQuarantineArticles";
import { quarantineHazard } from "@/lib/warehouse/quarantine";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMemo } from "react";
import { useQuarantineLegalDays } from "@/hooks/general/useCompanySettings";
import { useCriticalAlertSources } from "./useCriticalAlertSources";
import { CriticalAlert } from "./types";

/**
 * Alerta por artículo retenido esperando corrección. Es de tipo `hazard`: no se
 * confirma ni se descarta, porque resolver exige editar el artículo o su
 * documentación —trabajo que no cabe en un popover— y el plazo legal sigue
 * corriendo aunque nadie quiera verla. Solo informa y enlaza al submódulo.
 */
export const useQuarantineAlerts = () => {
  const { selectedCompany } = useCompanyStore();
  const legalDays = useQuarantineLegalDays();

  const { hasSource } = useCriticalAlertSources();

  // El backend publica la fuente solo si el módulo está montado, la compañía
  // la tiene activa y este usuario está en su audiencia configurada.
  const canSeeQuarantineAlerts = hasSource("quarantine_article");

  // Solo lo que espera corrección: un artículo ya enviado a re-inspección no
  // está en manos de compras y alertarlo sería ruido.
  const { data, isLoading } = useGetQuarantineArticles("OPEN", {
    enabled: canSeeQuarantineAlerts,
  });

  const records = useMemo(
    () => (canSeeQuarantineAlerts ? (data ?? []) : []),
    [canSeeQuarantineAlerts, data],
  );

  const alerts = useMemo<CriticalAlert[]>(() => {
    const companySlug = selectedCompany?.slug;

    return records.map((record) => {
      const hazard = quarantineHazard(
        record.quarantine_entry_date,
        legalDays,
        record.days_in_quarantine,
      );

      // El backend ya sabe si venció; el cálculo local solo cubre el
      // registro sin fecha utilizable.
      const isExpired = record.is_overdue || hazard.isExpired;

      // Sin identidad legible la tarjeta mostraría una línea en blanco;
      // el número de registro al menos permite ubicarlo en el listado.
      const articleLabel =
        [
          record.article?.part_number,
          record.article?.batch?.name,
          record.article?.serial ? `S/N ${record.article.serial}` : null,
        ]
          .filter(Boolean)
          .join(" - ") || `Registro #${record.id}`;

      const attempts = record.cycles?.length ?? 0;

      const reason = record.reason?.trim();
      const reasonLine = reason ? `Motivo: ${reason}` : "Sin motivo registrado";
      // El primer ciclo es la retención original: solo a partir del
      // segundo hubo una corrección que no superó la re-inspección.
      const retries = Math.max(0, attempts - 1);
      const recurrenceLine =
        retries > 0
          ? `\nYa se corrigió ${retries} ${retries === 1 ? "vez" : "veces"} sin superar la re-inspección.`
          : "";

      return {
        id: `quarantine-article-${record.id}`,
        source: "quarantine-article",
        sourceId: record.id,
        variant: "quarantine-hazard",
        tone: "hazard",
        // Ordena por plazo consumido: el tramo vencido queda por
        // encima de cualquier alerta de stock, que no tiene reloj legal.
        // Entre vencidos manda el que lleva más días de exceso.
        weight: isExpired
          ? 200 + Math.max(0, -(hazard.remaining ?? 0))
          : 100 + Math.round(hazard.progress * 100),
        // El plazo corre aunque se oculte el aviso.
        isDismissable: false,
        hazard: {
          tier: isExpired ? 5 : hazard.tier,
          // Si el backend lo da por vencido, la barra va llena aunque
          // el cálculo local no llegue: mostrar 80% bajo un título de
          // vencido haría dudar de cuál de los dos datos es el bueno.
          progress: isExpired ? 1 : hazard.progress,
          isExpired,
          daysElapsed: hazard.days ?? record.days_in_quarantine ?? 0,
          legalDays,
          remaining: hazard.remaining,
        },
        title: isExpired
          ? "Plazo legal de cuarentena vencido"
          : "Artículo retenido en cuarentena",
        label: articleLabel,
        // El plazo lo dibuja la tarjeta desde `hazard`; repetirlo aquí
        // sería el mismo dato dos veces.
        description: `${reasonLine}${recurrenceLine}`,
        // Lo vencido es exposición ante el ente, no solo urgencia interna.
        severity: isExpired ? "critical" : "warning",
        href: companySlug ? `/${companySlug}/compras/cuarentena` : undefined,
        hrefLabel: "Ir a cuarentena",
      } satisfies CriticalAlert;
    });
  }, [records, selectedCompany?.slug, legalDays]);

  return {
    alerts,
    isLoading: canSeeQuarantineAlerts && isLoading,
  };
};
