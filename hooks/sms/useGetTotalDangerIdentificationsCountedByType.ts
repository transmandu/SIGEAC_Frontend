import axiosInstance from "@/lib/axios";
import { DangerIdentificationsByType, pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchTotalDangerIdentificationsCountedByType = async (
  from: string,
  to: string,
) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/total-danger-identifications/counted-by-type?from=${from}&to=${to}`
  );
  return data;
};

export const  useGetTotalDangerIdentificationsCountedByType = (
  from: string,
  to: string,
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["total-danger-identifications/counted-by-type?from=${from}&to=${to}"], // Incluye el ID en la clave de la query
    queryFn: () => fetchTotalDangerIdentificationsCountedByType(from, to), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};