import axiosInstance from '@/lib/axios';
import { DangerIdentification, User, VoluntaryReport } from '@/types';
import { useQuery } from '@tanstack/react-query';



const fetDangerIdentificationById = async (id: string | number) => {
  const {data} = await axiosInstance.get(`transmandu/sms/danger-identifications/${id}`);
  return data;
};

export const useGetDangerIdentificationById = (id: string | number) => {
  return useQuery<DangerIdentification>({
    queryKey: ['danger-identification-by-id',id], // Incluye el ID en la clave de la query
    queryFn: () => fetDangerIdentificationById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
