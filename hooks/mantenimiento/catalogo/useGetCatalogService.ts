import axios from '@/lib/axios';
import { CatalogService } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

const fetchCatalogService = async (company: string | undefined, id: number | string): Promise<CatalogService> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-services/${id}`);
  return data;
};

// Detalle con manual + tasks.requirements + aircrafts, para la página de
// detalle/edición del servicio y para el selector de tareas del picker.
export const useGetCatalogService = (company: string | undefined, id: number | string | undefined) => {
  return useQuery<CatalogService, Error>({
    queryKey: ["maintenance-catalog-service", company, id],
    queryFn: () => fetchCatalogService(company, id as number | string),
    enabled: !!company && !!id,
  });
};
