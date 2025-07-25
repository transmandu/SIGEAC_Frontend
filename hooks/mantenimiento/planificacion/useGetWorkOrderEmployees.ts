import axiosInstance from '@/lib/axios';
import { Employee, Warehouse } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrderEmployees = async (company?: string): Promise<Employee[]> => {
  const  {data}  = await axiosInstance.get(`/${company}/work-orders-employee`);
  return data;
};

export const useGetWorkOrderEmployees = (company?: string) => {
  return useQuery<Employee[]>({
    queryKey: ['work-orders-employee', company],
    queryFn: () => fetchWorkOrderEmployees(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
