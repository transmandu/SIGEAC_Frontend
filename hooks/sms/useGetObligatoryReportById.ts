import axiosInstance from "@/lib/axios";
import { ObligatoryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcObligatoryReportById = async (id: string | number) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/obligatory-reports/${id}`
  );
  return data;
};

export const useGetObligatoryReportById = (id: string | number) => {
  return useQuery<ObligatoryReport>({
    queryKey: ["obligatory-reports", id], // Incluye el ID en la clave de la query
    queryFn: () => fetcObligatoryReportById(id), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
