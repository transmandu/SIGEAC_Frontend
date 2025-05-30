import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Role } from '@/types';

const fetchRoles = async (): Promise<Role[]> => {
  const  response  = await axios.get('/role');
  const roles = response.data
  return roles;
};

export const useGetRoles = () => {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
