import axiosInstance from "@/lib/axios";
import { ObligatoryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchObligatoryReports = async (): Promise<ObligatoryReport[]> => {
  const { data } = await axiosInstance.get("/transmandu/sms/obligatory-reports");
  return data;
};

export const useGetObligatoryReports = () => {
  return useQuery<ObligatoryReport[]>({
    queryKey: ["obligatory-reports"],
    queryFn: fetchObligatoryReports,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
