import axios from '@/lib/axios';
import { CatalogManual, CatalogStatus } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

type Filters = {
  status?: CatalogStatus;
};

const fetchCatalogManuals = async (
  company: string | undefined,
  filters: Filters,
): Promise<CatalogManual[]> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-manuals`, {
    params: { status: filters.status },
  });
  return data;
};

export const useGetCatalogManuals = (company: string | undefined, filters: Filters = {}) => {
  return useQuery<CatalogManual[], Error>({
    queryKey: ["maintenance-catalog-manuals", company, filters.status ?? null],
    queryFn: () => fetchCatalogManuals(company, filters),
    enabled: !!company,
  });
};
