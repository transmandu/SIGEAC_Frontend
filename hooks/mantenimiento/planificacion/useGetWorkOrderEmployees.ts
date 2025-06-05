import axiosInstance from '@/lib/axios';
import { Employee, Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrderEmployees = async (): Promise<Employee[]> => {
  const  {data}  = await axiosInstance.get('/hangar74/work-orders-employee');
  return data;
};

export const useGetWorkOrderEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ['work-orders-employee'],
    queryFn: fetchWorkOrderEmployees,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
