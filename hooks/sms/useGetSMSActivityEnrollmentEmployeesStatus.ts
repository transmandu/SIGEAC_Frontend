import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface EnrolledEmployees {
  attended: Employee[];
  not_attended: Employee[];
}

const fetchEnrolledEmployees = async ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}): Promise<EnrolledEmployees> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_id}/employees-enrollment-status`
  );
  return data;
};

export const useGetSMSActvityEnrollmentEmployeesStatus = ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}) => {
  return useQuery<EnrolledEmployees>({
    queryKey: ["sms-activity-status-employees"], // Incluye el activity_id en la clave
    queryFn: () => fetchEnrolledEmployees({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si activity_id tiene valor
  });
};
