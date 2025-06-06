import axiosInstance from "@/lib/axios";
import { Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchPilots = async (): Promise<Pilot[]> => {
  const { data } = await axiosInstance.get("/transmandu/pilots");
  return data;
};

export const useGetPilots = () => {
  return useQuery<Pilot[]>({
    queryKey: ["pilots"],
    queryFn: fetchPilots,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
