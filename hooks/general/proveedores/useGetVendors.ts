import axiosInstance from '@/lib/axios';
import { Vendor } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchVendors = async (company: string | undefined): Promise<Vendor[]> => {
  const {data} = await axiosInstance.get(`/${company}/vendors`);
  return data;
};

export const useGetVendors = (company: string | undefined) => {
  return useQuery<Vendor[]>({
    queryKey: ["vendors", company],
    queryFn: () => fetchVendors(company),
    enabled: !!company,
  });
};
