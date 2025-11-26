import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
}
interface AttendanceData {
  id: string;
  attended: Boolean;
  employee_dni: string;
  sms_activity_id: string;
  employee: EmployeeData;
}

const fetchAttendanceList = async ({
  company,
  activity_id,
}: {
  company?: string;
  activity_id: string;
}): Promise<AttendanceData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_id}/attendance-list`
  );
  return data;
};

export const useGetActivityAttendanceList = ({
  company,
  activity_id,
}: {
  company?: string;
  activity_id: string;
}) => {
  return useQuery<AttendanceData[], Error>({
    queryKey: ["sms-activity-attendance-list"], // Incluye el activity_id en la clave
    queryFn: () => fetchAttendanceList({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si activity_id tiene valor
  });
};
