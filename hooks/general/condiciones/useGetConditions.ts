import axios from '@/lib/axios';
import { Manufacturer } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchManufacturers = async (company: string | undefined): Promise<Manufacturer[]> => {
  const {data} = await axios.get(`/${company}/manufacturers`);
  return data;
};

export const useGetManufacturers = (company: string | undefined) => {
  return useQuery<Manufacturer[]>({
    queryKey: ["manufacturers"],
    queryFn: () => fetchManufacturers(company),
    enabled: !!company,
  });
};
