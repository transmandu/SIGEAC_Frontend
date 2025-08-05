import axios from '@/lib/axios';
import { Employee } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const fetchUserDepartamentEmployees = async (company?: string): Promise<Employee[]> => {
  const {data} = await axios.get(`/${company}/user-department-employees`);
  return data;
};

export const useGetUserDepartamentEmployees = (company?: string) => {
  return useQuery<Employee[], Error>({
    queryFn: () => fetchUserDepartamentEmployees(company),
    queryKey: ['departament-employees', company],
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
    refetchOnWindowFocus: false,
  });
};
