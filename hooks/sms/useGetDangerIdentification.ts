import axiosInstance from "@/lib/axios";
import { DangerIdentification, InformationSource, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDangerIdentifications = async (): Promise<DangerIdentification[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/danger-identifications");
  return data;
};

export const useGetDangerIdentifications = () => {
  return useQuery<DangerIdentification[]>({
    queryKey: ["danger-identifications"],
    queryFn: fetchDangerIdentifications,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
