import axios from '@/lib/axios';
import { Company } from '@/types';
import { useMutation } from '@tanstack/react-query';

const fetchPermissionsByCompanyId = async (id: number): Promise<Company[]> => {
  const {data} = await axios.post('/permissions', { id });
  return data;
};

// Lectura vía POST: el backend recibe el filtro en el body. Usa useMutation
// porque se dispara a demanda, no porque modifique algo.
export const useGetPermissionsByCompanyId = () => {
  return useMutation<Company[], Error, number>({
    mutationFn: fetchPermissionsByCompanyId,
  });
};
