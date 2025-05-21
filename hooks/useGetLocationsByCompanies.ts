import axiosInstance from '@/lib/axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface LocationsByCompany {
    company_id: number,
    locations: Location[]
}[]

// Ajusta la función de fetch para que devuelva la estructura esperada
const fetchLocations = async (): Promise<LocationsByCompany[]> => {
  const { data } = await axiosInstance.get('/locations-by-companies');
  return data.companies_location;
};

export const useGetLocationsByCompanies = () => {
  return useQuery<LocationsByCompany[]>({
    queryKey: ['location'],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
