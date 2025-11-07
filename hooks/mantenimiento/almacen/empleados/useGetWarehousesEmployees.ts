import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWarehousesEmployees = async (
  location_id: number,
  company?: string
): Promise<Employee[]> => {
  const { data } = await axios.get(`/${company}/employee-warehouse`, {
    params: { location_id }
  });
  return data;
};

export const useGetWarehousesEmployees = (
  company?: string,
  location_id?: string | number | null
) => {
  return useQuery<Employee[], Error>({
    queryKey: ['warehouses-employees', company, location_id],
    queryFn: () => fetchWarehousesEmployees(Number(location_id!), company!),
    enabled: !!company && !!location_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
