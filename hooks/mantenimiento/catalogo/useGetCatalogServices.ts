import axios from '@/lib/axios';
import { CatalogCategory, CatalogService } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

type Filters = {
  aircraftId?: number | string;
  category?: CatalogCategory;
};

const fetchCatalogServices = async (
  company: string | undefined,
  filters: Filters,
): Promise<CatalogService[]> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-services`, {
    params: {
      aircraft_id: filters.aircraftId,
      category: filters.category,
    },
  });
  return data;
};

// aircraftId es el filtro real del selector: sin aeronave, no tiene sentido
// mostrar el catálogo completo de otras aeronaves.
export const useGetCatalogServices = (company: string | undefined, filters: Filters = {}) => {
  return useQuery<CatalogService[], Error>({
    queryKey: ["maintenance-catalog-services", company, filters.aircraftId ?? null, filters.category ?? null],
    queryFn: () => fetchCatalogServices(company, filters),
    enabled: !!company,
  });
};
