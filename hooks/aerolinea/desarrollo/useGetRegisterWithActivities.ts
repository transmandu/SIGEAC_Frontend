import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchRegisterWithActivities = async (): Promise<ActivityReport[]> => {
  const { data } = await axiosInstance.get(`/transmandu/activity-report`);
  
  // Validación básica de la respuesta
  if (!Array.isArray(data)) {
    throw new Error("Formato de respuesta inválido: se esperaba un array");
  }
  
  return data;
};

export const useGetRegisterWithActivities = () => {
  return useQuery<ActivityReport[], Error>({
    queryKey: ["activity-reports"],
    queryFn: fetchRegisterWithActivities,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    gcTime: 1000 * 60 * 10, // 10 minutos en caché (garbage collection)
    refetchOnWindowFocus: false, // Evita recargas innecesarias
    retry: (failureCount, error) => 
      failureCount < 2 && !error.message.includes("inválido") // No reintentar para errores de formato
  });
};