import axios from '@/lib/axios';
import { Module } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchModulesByCompanyId = async (id: number): Promise<Module[]> => {
  const response = await axios.post('/modules', { id });
  return response.data;
};

export const useGetModulesByCompanyId = () => {
  return useMutation<Module[], Error, number>({
    mutationFn: fetchModulesByCompanyId,
  });
};
