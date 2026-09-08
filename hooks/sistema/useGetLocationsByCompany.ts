import axiosInstance from '@/lib/axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchLocations = async (company: string | undefined): Promise<Location[]> => {
  const { data } = await axiosInstance.get(`/${company}/locations`);
  return data;
};

export const useGetLocationsByCompany = (company: string | undefined) => {
  return useQuery<Location[]>({
    // La compañía va en la clave: sin ella, al cambiar de empresa se sirven
    // las sedes cacheadas de la anterior.
    queryKey: ['location', company],
    queryFn: () => fetchLocations(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
