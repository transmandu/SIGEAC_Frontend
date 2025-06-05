import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchWarehousesEmployees = async (location_id: number): Promise<Employee[]> => {
  const {data} = await axios.post('/hangar74/employee-warehouse', { location_id });
  return data;
};

export const useGetWarehousesEmployees = () => {
  return useMutation<Employee[], Error, number>({
    mutationFn: fetchWarehousesEmployees,
  });
};
