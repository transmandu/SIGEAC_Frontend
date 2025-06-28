import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchEmployeesByCompany = async ( company: string | undefined): Promise<Employee[]> => {
  const {data} = await axiosInstance.get(`/${company}/employees`)
  return data;
};

export const useGetEmployeesByCompany = ( company: string | undefined) => {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: () => fetchEmployeesByCompany(company),
    enabled: !!company,
    refetchOnWindowFocus: false,
  })
}
