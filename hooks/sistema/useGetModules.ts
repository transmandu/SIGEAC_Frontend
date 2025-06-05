import axios from '@/lib/axios';
import { Module, Permission } from '@/types';
import { useQuery } from '@tanstack/react-query';

const fetchModules = async (): Promise<Module[]> => {
  const  response  = await axios.get('/modules');
  const permissions = response.data;
  return permissions;
};

export const useGetModules = () => {
  return useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: fetchModules,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
