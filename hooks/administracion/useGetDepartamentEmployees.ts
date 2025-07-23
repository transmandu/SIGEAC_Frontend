import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchDepartamentEmployees = async (location_id: number): Promise<Employee[]> => {
  const {data} = await axios.post('/hangar74/employees-department', { location_id });
  return data;
};

export const useGetDepartamentEmployees = () => {
  return useMutation<Employee[], Error, number>({
    mutationFn: fetchDepartamentEmployees,
  });
};
