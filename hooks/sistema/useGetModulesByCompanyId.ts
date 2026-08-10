import axios from '@/lib/axios';
import { Module } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchModulesByCompanyId = async (id: number): Promise<Module[]> => {
  const response = await axios.post('/modules', { id });
  return response.data;
};

// Lectura vía POST: el backend recibe el filtro en el body. Usa useMutation
// porque se dispara a demanda, no porque modifique algo.
export const useGetModulesByCompanyId = () => {
  return useMutation<Module[], Error, number>({
    mutationFn: fetchModulesByCompanyId,
  });
};
