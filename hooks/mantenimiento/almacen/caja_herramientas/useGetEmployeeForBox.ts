import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchWorkOrderEmployees = async (
  location_id: string | null,
  company?: string,
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/employees-with-box`
  );
  return data;
};

export const useGetEmployeesForBox = (
  location_id: string | null,
  company?: string,
) => {
  return useQuery<Employee[]>({
    queryKey: ["work-orders-employee", company, location_id],
    queryFn: () => fetchWorkOrderEmployees(location_id!, company!),
    enabled: !!location_id && !!company,
  });
};
