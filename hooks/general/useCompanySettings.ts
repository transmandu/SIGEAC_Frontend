import axiosInstance from "@/lib/axios";
import { DEFAULT_QUARANTINE_LEGAL_DAYS } from "@/lib/warehouse/quarantine";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

export type CompanySettings = {
  quarantine_legal_days?: string | number;
  /** Zona con que se MUESTRAN las fechas; el guardado siempre es UTC. */
  timezone?: string;
};

const fetchCompanySettings = async (company?: string): Promise<CompanySettings> => {
  const { data } = await axiosInstance.get(`/${company}/company-settings`);
  return data;
};

export const useCompanySettings = () => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<CompanySettings>({
    queryKey: ["company-settings", selectedCompany?.slug],
    queryFn: () => fetchCompanySettings(selectedCompany?.slug),
    // Cambian muy rara vez y varias vistas los piden a la vez.
    staleTime: 1000 * 60 * 30,
    enabled: !!selectedCompany?.slug,
  });
};

/**
 * El plazo listo para calcular, sin que cada vista tenga que resolver el
 * fallback ni convertir el string que devuelve la tabla clave/valor.
 */
export const useQuarantineLegalDays = () => {
  const { data } = useCompanySettings();

  const parsed = Number(data?.quarantine_legal_days);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_QUARANTINE_LEGAL_DAYS;
};
