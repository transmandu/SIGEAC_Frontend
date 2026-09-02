import axios from '@/lib/axios';
import { CatalogCategory, CatalogService, CatalogStatus } from '@/types/maintenanceCatalog';
import { useQuery } from '@tanstack/react-query';

type Filters = {
  aircraftId?: number | string;
  category?: CatalogCategory;
  status?: CatalogStatus;
  /** Agrega tasks.requirements — lo pide el picker para buscar por ATA/N° de parte. */
  withTasks?: boolean;
  /**
   * Difiere la consulta. El picker se monta una vez por fila del formulario:
   * sin esto, abrir el formulario dispara una consulta por fila aunque el
   * usuario no llegue a abrir ninguno.
   */
  enabled?: boolean;
};

const fetchCatalogServices = async (
  company: string | undefined,
  filters: Filters,
): Promise<CatalogService[]> => {
  const { data } = await axios.get(`/${company}/maintenance-catalog-services`, {
    params: {
      aircraft_id: filters.aircraftId,
      category: filters.category,
      status: filters.status,
      with_tasks: filters.withTasks ? 1 : undefined,
    },
  });
  return data;
};

// aircraftId es el filtro real del selector: sin aeronave, no tiene sentido
// mostrar el catálogo completo de otras aeronaves.
export const useGetCatalogServices = (company: string | undefined, filters: Filters = {}) => {
  return useQuery<CatalogService[], Error>({
    queryKey: [
      "maintenance-catalog-services",
      company,
      filters.aircraftId ?? null,
      filters.category ?? null,
      filters.status ?? null,
      filters.withTasks ?? null,
    ],
    queryFn: () => fetchCatalogServices(company, filters),
    enabled: !!company && filters.enabled !== false,
  });
};
