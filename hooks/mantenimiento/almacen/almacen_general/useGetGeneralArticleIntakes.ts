import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GeneralArticleIntake, GeneralArticleIntakeStatus } from '@/types/purchase';

const fetchGeneralArticleIntakes = async (
  company: string,
  location_id: string,
  status?: GeneralArticleIntakeStatus,
  warehouseOnly?: boolean,
  range?: { from?: string; to?: string }
): Promise<GeneralArticleIntake[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/general-article-intakes`, {
    params: {
      ...(status ? { status } : {}),
      ...(warehouseOnly ? { destination: 'warehouse' } : {}),
      ...(range?.from ? { date_from: range.from } : {}),
      ...(range?.to ? { date_to: range.to } : {}),
    },
  });
  return data;
};

// warehouseOnly: el panel de Recepción de Artículos del almacén solo muestra
// las entradas destinadas a un almacén — las entregas directas a
// departamento/empleado/autorizado/tercero nunca entran al inventario y solo
// viven en la Recepción General de compras.
export const useGetGeneralArticleIntakes = (
  status?: GeneralArticleIntakeStatus,
  options?: { warehouseOnly?: boolean; from?: string; to?: string }
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const warehouseOnly = options?.warehouseOnly ?? false;
  const range = { from: options?.from, to: options?.to };

  return useQuery<GeneralArticleIntake[], Error>({
    queryKey: ['general-article-intakes', selectedCompany?.slug, selectedStation, status, warehouseOnly, range.from, range.to],
    queryFn: () => fetchGeneralArticleIntakes(selectedCompany!.slug, selectedStation, status, warehouseOnly, range),
    enabled: !!selectedCompany && !!selectedStation,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};
