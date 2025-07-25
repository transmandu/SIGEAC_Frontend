import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchWarehousesEmployees = async (
  location_id: number,
  company?: string
): Promise<Employee[]> => {
  const { data } = await axios.post(`/${company}/employee-warehouse`, { location_id });
  return data;
};

export const useGetWarehousesEmployees = (company?: string) => {
  return useMutation<Employee[], Error, { location_id: number }>(
    {
      mutationKey: ['warehouses-employees', company],
      mutationFn: ({ location_id }) => fetchWarehousesEmployees(location_id, company!),
    }
  );
};
