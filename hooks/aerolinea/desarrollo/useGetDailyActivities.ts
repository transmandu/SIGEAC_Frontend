import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDailyActivity = async ({
  date,
  user_id
}: {
  date: string;
  user_id: string | null;
}): Promise<ActivityReport> => {
  const { data } = await axiosInstance.get("/transmandu/daily-activities", {
    params: { date, user_id }
  });
  if (!data[0]) throw new Error("No se encontró el reporte diario"); // Mejor manejo de casos vacíos
  return data[0];
};

export const useGetDailyActivityReport = ({
  date,
  user_id
}: {
  date: string;
  user_id: string | null;
}) => {
  return useQuery<ActivityReport>({
    queryKey: ["daily-activity", date, user_id], // Incluye todos los parámetros en la clave
    queryFn: () => fetchDailyActivity({ date, user_id }),
    enabled: !!user_id && !!date, // Habilita solo si tenemos ambos valores
    retry: (failureCount, error) => {
      // No reintentar para errores 404 (no encontrado)
      return error.message !== "No se encontró el reporte diario" && failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // Datos frescos por 5 minutos
    gcTime: 10 * 60 * 1000, // Mantener en caché por 10 minutos
    refetchOnWindowFocus: false // Evita recargas innecesarias
  });
};