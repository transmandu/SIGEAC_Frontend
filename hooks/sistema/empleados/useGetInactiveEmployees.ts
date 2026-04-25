import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchInactiveEmployeesByCompany = async (
  company: string | undefined
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/employees/inactive`
  );

  return data;
};

export const useGetInactiveEmployeesByCompany = (company: string | undefined) => {
  return useQuery<Employee[], Error>({
    queryKey: ['employees-inactive', company],
    queryFn: () => fetchInactiveEmployeesByCompany(company),
    enabled: !!company,
    refetchOnWindowFocus: false,
  });
};