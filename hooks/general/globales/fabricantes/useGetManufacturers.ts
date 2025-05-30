import axiosInstance from '@/lib/axios';
import { Manufacturer } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchManufacturers = async (company: string | null): Promise<Manufacturer[]> => {
  const {data} = await axiosInstance.get(`/${company}/manufacturer`);
  return data;
};

export const useGetManufacturers = (company: string | null) => {
  return useQuery<Manufacturer[]>({
    queryKey: ["manufacturers"],
    queryFn: () => fetchManufacturers(company),
    enabled: !!company
  });
};
