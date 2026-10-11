import axios from '@/lib/axios';
import { Department } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchDepartments = async (
  company: string | undefined,
  includeInactive: boolean,
): Promise<Department[]> => {
  const { data } = await axios.get(`/${company}/departments`, {
    params: includeInactive ? { include_inactive: 1 } : undefined,
  });
  return data;
};

export const useGetDepartments = (
  company: string | undefined,
  options?: { includeInactive?: boolean },
) => {
  const includeInactive = options?.includeInactive ?? false;

  return useQuery<Department[], Error>({
    queryKey: ['departments', company, { includeInactive }],
    queryFn: () => fetchDepartments(company, includeInactive),
    enabled: !!company,
  });
};
