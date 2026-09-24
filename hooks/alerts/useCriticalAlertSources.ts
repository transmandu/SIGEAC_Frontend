import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";

/**
 * Fuentes de alerta que existen en la empresa activa. Tiene que coincidir con
 * las keys que publica config/critical_alert_sources.php en el backend.
 */
export type CriticalAlertSourceKey =
  | "low_stock_general"
  | "low_stock_consumable"
  | "quarantine_article"
  | "maintenance_control";

const fetchCriticalAlertSources = async (
  company: string,
): Promise<CriticalAlertSourceKey[]> => {
  const { data } = await axios.get(`/${company}/critical-alert-sources`);
  return data.sources ?? [];
};

/**
 * No toda empresa tiene el módulo que origina cada alerta: Transmandu no tiene
 * almacén general ni cuarentena, así que pedir esas alertas ahí era un 500 por
 * carga contra tablas inexistentes. El backend responde qué hay de verdad
 * (chequeo de tablas, no el tipo de empresa) y cada hook de alerta se habilita
 * solo si su fuente aparece.
 *
 * Espeja el enfoque del Calendario de Eventos, donde una fuente que no existe
 * en la empresa simplemente no se publica.
 *
 * Qué módulos tiene una empresa casi nunca cambia —hace falta correr una
 * migración—, así que se cachea largo: es una petición por sesión y empresa
 * que ahorra las de todas las alertas que no aplican.
 */
export const useCriticalAlertSources = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug;

  const { data, isLoading } = useQuery<CriticalAlertSourceKey[]>({
    queryKey: ["critical-alert-sources", companySlug],
    queryFn: () => fetchCriticalAlertSources(companySlug!),
    enabled: !!companySlug,
    staleTime: 1000 * 60 * 30,
  });

  /**
   * Mientras no se sepa qué hay, responde `false`: es preferible que una
   * alerta aparezca un instante tarde a disparar la petición que este
   * endpoint existe para evitar.
   *
   * Estable entre renders a propósito: los hooks de alerta la usan dentro de
   * un `useMemo`, y una función nueva en cada render recalcularía sus listas
   * de alertas sin parar.
   */
  const hasSource = useCallback(
    (key: CriticalAlertSourceKey) => (data ?? []).includes(key),
    [data],
  );

  return { hasSource, isLoading };
};
