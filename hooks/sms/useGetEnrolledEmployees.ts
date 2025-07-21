import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchEnrolledEmployees = async ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}): Promise<Employee[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_id}/enrolled-employees`
  );
  return data;
};

export const useGetActivityEnrolledEmployees = ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}) => {
  return useQuery<Employee[], Error>({
    queryKey: ["enrolled-employees"], // Incluye el activity_id en la clave
    queryFn: () => fetchEnrolledEmployees({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si activity_id tiene valor
  });
};
