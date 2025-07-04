import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEnrolledEmployees = async (
  activity_id: string
): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/activities/${activity_id}/enrolled-employees`
  );
  return data;
};

export const useGetEnrolledEmployees = (activity_id: string) => {
  return useQuery<Employee[], Error>({
    queryKey: ["enrolled-employees"], // Incluye el activity_id en la clave
    queryFn: () => fetchEnrolledEmployees(activity_id),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!activity_id, // Solo ejecuta si activity_id tiene valor
  });
};
