import axiosInstance from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchEmployeesByCompany = async ( company: string | undefined): Promise<Employee[]> => {
  const {data} = await axiosInstance.get(`/${company}/employees-by-company`)
  return data;
};

export const useGetEmployeesByCompany = ( company: string | undefined) => {
  return useQuery<Employee[], Error, string>({
    queryKey: ['employees'],
    queryFn: () => fetchEmployeesByCompany(company),
    enabled: !!company,
    refetchOnWindowFocus: false,
  })
}
