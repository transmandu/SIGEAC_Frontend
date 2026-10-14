import axiosInstance from "@/lib/axios";
import { Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPilotByDni = async (company: string, dni: string) => {
  const { data } = await axiosInstance.get(`/${company}/pilots/${dni}`);
  return data;
};

export const useGetPilotByDni = (company?: string, dni?: string) => {
  return useQuery<Pilot>({
    queryKey: ["pilots", company, dni],
    queryFn: () => fetchPilotByDni(company!, dni!),
    enabled: !!company && !!dni,
    staleTime: 1000 * 60 * 5,
  });
};
