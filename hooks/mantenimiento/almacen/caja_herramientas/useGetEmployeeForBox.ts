import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrderEmployees = async (
  location_id: string | null,
  company?: string,
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(`/${company}/employees-with-box/${location_id}`);
  return data;
};

export const useGetEmployeesForBox = (
  location_id: string | null,
  company?: string,
) => {
  return useQuery<Employee[]>({
    queryKey: ['work-orders-employee', company, location_id],
    queryFn: () => fetchWorkOrderEmployees(company!, location_id!),
    enabled: !!location_id && !!company,
  });
};
