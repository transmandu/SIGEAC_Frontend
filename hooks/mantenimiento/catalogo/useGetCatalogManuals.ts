import axios from '@/lib/axios';
import { CatalogManual, CatalogStatus } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

type Filters = {
  status?: CatalogStatus;
  /** Solo manuales con algún servicio/certificado ya asignado a esta aeronave. */
  aircraftId?: number | string;
};

const fetchCatalogManuals = async (
  company: string | undefined,
  filters: Filters,
): Promise<CatalogManual[]> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-manuals`, {
    params: { status: filters.status, aircraft_id: filters.aircraftId },
  });
  return data;
};

export const useGetCatalogManuals = (company: string | undefined, filters: Filters = {}) => {
  return useQuery<CatalogManual[], Error>({
    queryKey: ["maintenance-catalog-manuals", company, filters.status ?? null, filters.aircraftId ?? null],
    queryFn: () => fetchCatalogManuals(company, filters),
    enabled: !!company,
  });
};
