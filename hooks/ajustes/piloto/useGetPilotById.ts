import axiosInstance from "@/lib/axios";
import { Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcPilotByDni = async (dni: string) => {
  const { data } = await axiosInstance.get(`transmandu/pilots/${dni}`);
  return data;
};

export const useGetPilotByDni = (dni: string) => {
  return useQuery<Pilot>({
    queryKey: ["pilots", dni],
    queryFn: () => fetcPilotByDni(dni),
    staleTime: 1000 * 60 * 5,
  });
};
