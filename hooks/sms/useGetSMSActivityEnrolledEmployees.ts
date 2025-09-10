import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
}

const fetchEnrolledEmployees = async ({
  company,
  activity_id,
}: {
  company?: string;
  activity_id: string;
}): Promise<EmployeeData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_id}/enrolled-employees`
  );
  return data;
};

export const useGetSMSActivityEnrolledEmployees = ({
  company,
  activity_id,
}: {
  company?: string ;
  activity_id: string;
}) => {
  return useQuery<EmployeeData[], Error>({
    queryKey: ["sms-activity-enrolled-employees"], // Incluye el activity_id en la clave
    queryFn: () => fetchEnrolledEmployees({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si activity_id tiene valor
  });
};
