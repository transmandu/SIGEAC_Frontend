import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import type { Requisition } from '@/types/purchase';

type RequisitionType = 'AERONAUTICAL' | 'GENERAL';

const fetchRequisition = async (company?: string, location_id?: string, type?: RequisitionType): Promise<Requisition[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/requisition-orders`, {
    params: type ? { type } : undefined,
  });
  return data;
};

export const useGetRequisition = (company?: string, location_id?: string, type?: RequisitionType) => {
  return useQuery<Requisition[]>({
    queryKey: ["requisitions-orders", company, location_id, type],
    queryFn: () => fetchRequisition(company, location_id, type),
    enabled: !!company && !!location_id,
    // Volver a la página dentro de esta ventana usa la caché en vez de
    // refetch-ear el listado completo; las mutaciones invalidan la key
    // por prefijo, así que los cambios propios se reflejan al instante.
    staleTime: 1000 * 60 * 2,
  });
};