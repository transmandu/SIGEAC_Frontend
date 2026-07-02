import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Role } from '@/types';

const fetchRoles = async (companyId?: number | string): Promise<Role[]> => {
  const params = companyId ? { company_id: companyId } : {};
  const response = await axios.get('/role', { params });
  const roles = response.data
  return roles;
};

export const useGetRoles = (companyId?: number | string) => {
  return useQuery<Role[]>({
    queryKey: ['roles', companyId],
    queryFn: () => fetchRoles(companyId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
