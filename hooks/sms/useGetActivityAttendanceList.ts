import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface EmployeeData {
  id?: string;
  first_name: string;
  last_name: string;
  dni: string;
}

interface AttendanceData {
  id: string;
  attended: Boolean;
  employee_dni: string | null;
  authorized_employee_id: number | null;
  employee_type: "local" | "authorized";
  employee: EmployeeData | null;
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
    queryKey: ["sms-activity-attendance-list", activityNumber],
    queryFn: () => fetchAttendanceList({ company, activityNumber }),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
