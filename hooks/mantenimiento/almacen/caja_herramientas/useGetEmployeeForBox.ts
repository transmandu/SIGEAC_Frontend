import axiosInstance from '@/lib/axios';
import { Employee, Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrderEmployees = async (location_id: string | null): Promise<Employee[]> => {
  const  {data}  = await axiosInstance.get(`/hangar74/employees-with-box/${location_id}`);
  return data;
};

export const useGetEmployeesForBox = (location_id: string | null) => {
  return useQuery<Employee[]>({
    queryKey: ['work-orders-employee'],
    queryFn: () => fetchWorkOrderEmployees(location_id),
    enabled: !!location_id
  });
};
