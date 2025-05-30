import axios from '@/lib/axios';
import { Manufacturer } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchManufacturers = async (): Promise<Manufacturer[]> => {
  const {data} = await axios.get(`/hangar74/manufacturer`);
  return data;
};

export const useGetManufacturers = () => {
  return useQuery<Manufacturer[]>({
    queryKey: ["manufacturers"],
    queryFn: fetchManufacturers,
  });
};
