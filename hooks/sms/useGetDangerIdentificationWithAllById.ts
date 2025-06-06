import axiosInstance from '@/lib/axios';
import { DangerIdentificationWithAll, MitigationTable } from '@/types';
import { useQuery } from '@tanstack/react-query';



const fetDangerIdentificationWithAllById = async (id: string | number) => {
  const {data} = await axiosInstance.get(`transmandu/sms/danger-identification/with-all-by/${id}`);
  return data;
};

export const useGetDangerIdentificationWithAllById = (id: string | number) => {
  return useQuery<MitigationTable>({
    queryKey: ['danger-identification/with-all-by', id], // Incluye el ID en la clave de la query
    queryFn: () => fetDangerIdentificationWithAllById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
