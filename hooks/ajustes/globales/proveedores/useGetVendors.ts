import axiosInstance from '@/lib/axios';
import { Vendor } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchVendors = async (company: string | null): Promise<Vendor[]> => {
  const {data} = await axiosInstance.get(`/${company}/vendors`);
  return data;
};

export const useGetVendors = (company: string | null) => {
  return useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: () => fetchVendors(company),
    enabled: !!company,
  });
};
