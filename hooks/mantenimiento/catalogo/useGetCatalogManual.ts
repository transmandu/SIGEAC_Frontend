import axios from '@/lib/axios';
import { CatalogManual } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

const fetchCatalogManual = async (company: string | undefined, id: number | string): Promise<CatalogManual> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-manuals/${id}`);
  return data;
};

// Detalle con services.tasks + services.aircrafts, para la página del manual.
export const useGetCatalogManual = (company: string | undefined, id: number | string | undefined) => {
  return useQuery<CatalogManual, Error>({
    queryKey: ["maintenance-catalog-manual", company, id],
    queryFn: () => fetchCatalogManual(company, id as number | string),
    enabled: !!company && !!id,
  });
};
