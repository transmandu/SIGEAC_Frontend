import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchRegisterWithActivities = async (company?: string): Promise<ActivityReport[]> => {
  const { data } = await axiosInstance.get(`/${company}/activity-report`);

  if (!Array.isArray(data)) {
    throw new Error("Formato de respuesta inválido: se esperaba un array");
  }

  return data;
};

export const useGetRegisterWithActivities = (company?: string) => {
  return useQuery<ActivityReport[], Error>({
    queryKey: ["activity-reports"],
    queryFn: () => fetchRegisterWithActivities(company),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: !!company,
    retry: (failureCount, error) =>
      failureCount < 2 && !error.message.includes("inválido") // No reintentar para errores de formato
  });

};
