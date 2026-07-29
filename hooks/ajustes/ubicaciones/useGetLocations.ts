import axiosInstance from '@/lib/axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchLocations = async (): Promise<Location[]> => {
  const  {data}  = await axiosInstance.get('/locations');
  return data;
};

export const useGetLocations = () => {
  return useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
