import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchDailyActivity = async ({
  date,
  user_id,
  company
}: {
  date: string;
  user_id: string | null;
  company?: string
}): Promise<ActivityReport> => {
  const { data } = await axiosInstance.get(`/${company}/daily-activities`, {
    params: { date, user_id }
  });
  // El endpoint devuelve array vacío en vez de 404; se convierte en error para
  // distinguir "no hay reporte" de un fallo real (ver retry más abajo).
  if (!data[0]) throw new Error("No se encontró el reporte diario");
  return data[0];
};

export const useGetDailyActivityReport = ({
  date,
  user_id,
  company
}: {
  date: string;
  user_id: string | null;
  company?: string
}) => {
  return useQuery<ActivityReport>({
    queryKey: ["daily-activity", date, user_id, company],
    queryFn: () => fetchDailyActivity({ date, user_id, company }),
    enabled: !!user_id && !!date && !!company,
    // "No hay reporte" no se reintenta: reintentar no lo haría aparecer.
    retry: (failureCount, error) => {
      return error.message !== "No se encontró el reporte diario" && failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false 
  });
};
