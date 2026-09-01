import axios from '@/lib/axios';
import { CatalogManual } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

const fetchCatalogManuals = async (company: string | undefined): Promise<CatalogManual[]> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-manuals`);
  return data;
};

export const useGetCatalogManuals = (company: string | undefined) => {
  return useQuery<CatalogManual[], Error>({
    queryKey: ["maintenance-catalog-manuals", company],
    queryFn: () => fetchCatalogManuals(company),
    enabled: !!company,
  });
};
