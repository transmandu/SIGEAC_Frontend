import axios from '@/lib/axios';
import { Permission } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchPermissions = async (): Promise<Permission[]> => {
  const  response  = await axios.get('/permission');
  const permissions = response.data;
  return permissions;
};

export const useGetPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
