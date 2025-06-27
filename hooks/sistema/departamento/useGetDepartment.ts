import axios from '@/lib/axios';
import { Department } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchDepartments= async (company: string | undefined): Promise<Department[]> => {
  const {data} = await axios.get(`/${company}/departments`);
  return data;
};

export const useGetDepartments = (company: string | undefined) => {
  return useQuery<Department[], Error>({
    queryKey: ['departments', company],
    queryFn: () => fetchDepartments(company),
    enabled: !!company,
  });
};
