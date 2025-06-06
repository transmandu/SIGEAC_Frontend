import axiosInstance from "@/lib/axios";
import { DangerIdentificationsByType, pieChartData } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcDangerIdentificationsCountedByType = async (
  from: string,
  to: string,
  reportType: string,
) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/danger-identifications/counted-by-type?reportType=${reportType}&from=${from}&to=${to}`
  );
  return data;
};

export const  useGetDangerIdentificationsCountedByType = (
  from: string,
  to: string,
  reportType: string
) => {
  return useQuery<pieChartData[]>({
    queryKey: ["danger-identifications/counted-by-type?&reportType=${reportType}&from=${from}&to=${to}"], // Incluye el ID en la clave de la query
    queryFn: () => fetcDangerIdentificationsCountedByType(from, to,reportType), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
