import axiosInstance from "@/lib/axios";
import { ThirdParty, Vendor } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchThirdParties = async (): Promise<ThirdParty[]> => {
  const { data } = await axiosInstance.get(`/third-parties`);
  return data;
};

export const useGetThirdParties = () => {
  return useQuery<ThirdParty[]>({
    queryKey: ["third-parties"],
    queryFn: () => fetchThirdParties(),
  });
};
