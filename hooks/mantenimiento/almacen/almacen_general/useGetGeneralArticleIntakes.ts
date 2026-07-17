import axios from '@/lib/axios';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useQuery } from '@tanstack/react-query';
import type { GeneralArticleIntake, GeneralArticleIntakeStatus } from '@/types/purchase';

const fetchGeneralArticleIntakes = async (
  company: string,
  location_id: string,
  status?: GeneralArticleIntakeStatus,
  warehouseOnly?: boolean
): Promise<GeneralArticleIntake[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/general-article-intakes`, {
    params: {
      ...(status ? { status } : {}),
      ...(warehouseOnly ? { destination: 'warehouse' } : {}),
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
  options?: { warehouseOnly?: boolean }
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  const warehouseOnly = options?.warehouseOnly ?? false;

  return useQuery<GeneralArticleIntake[], Error>({
    queryKey: ['general-article-intakes', selectedCompany?.slug, selectedStation, status, warehouseOnly],
    queryFn: () => fetchGeneralArticleIntakes(selectedCompany!.slug, selectedStation, status, warehouseOnly),
    enabled: !!selectedCompany && !!selectedStation,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
