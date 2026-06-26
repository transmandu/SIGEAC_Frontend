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
  sms_activityNumber: string;
  employee: EmployeeData;
}

const fetchAttendanceList = async ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}): Promise<AttendanceData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activityNumber}/attendance-list`
  );
  return data;
};

export const useGetActivityAttendanceList = ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}) => {
  return useQuery<AttendanceData[], Error>({
    queryKey: ["sms-activity-attendance-list", activityNumber], // Incluye el activity_id en la clave
    queryFn: () => fetchAttendanceList({ company, activityNumber }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si activityNumber tiene valor
  });
};
