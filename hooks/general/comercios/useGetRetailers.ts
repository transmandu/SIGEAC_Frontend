import axiosInstance from "@/lib/axios";
import { Retailer } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchRetailers = async (company?: string): Promise<Retailer[]> => {
  const { data } = await axiosInstance.get(`/${company}/retailers`);
  return data;
};

export const useGetRetailers = (company?: string) => {
  return useQuery<Retailer[]>({
    queryKey: ["retailers", company],
    queryFn: () => fetchRetailers(company),
    enabled: !!company,
  });
};
