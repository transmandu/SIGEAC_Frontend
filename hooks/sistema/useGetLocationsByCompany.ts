import axiosInstance from '@/lib/axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchLocations = async (company: string | undefined): Promise<Location[]> => {
  const { data } = await axiosInstance.get(`/${company}/locations`);
  return data;
};

export const useGetLocationsByCompany = (company: string | undefined) => {
  return useQuery<Location[]>({
    queryKey: ['location'],
    queryFn: () => fetchLocations(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
