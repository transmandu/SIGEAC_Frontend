import axiosInstance from "@/lib/axios";
import { VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchVoluntaryReports = async (): Promise<VoluntaryReport[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/voluntary-reports");
  return data;
};

export const useGetVoluntaryReports = () => {
  return useQuery<VoluntaryReport[]>({
    queryKey: ["voluntary-reports"],
    queryFn: fetchVoluntaryReports,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
