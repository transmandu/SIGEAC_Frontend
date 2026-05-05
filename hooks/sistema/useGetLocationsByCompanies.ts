import axiosInstance from '@/lib/axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface LocationsByCompany {
  company_id: number;
  company_name: string;
  locations: Location[];
}

type LocationsByCompanyResponse = LocationsByCompany[];

// Ajusta la función de fetch para que devuelva la estructura esperada
export const useGetLocationsByCompanies = () => {
  return useQuery<LocationsByCompanyResponse>({
    queryKey: ['company-locations'], // 👈 sin company
    queryFn: async () => {
      const { data } = await axiosInstance.get('/locations-by-companies');
      return data.companies_location;
    },
  });
};