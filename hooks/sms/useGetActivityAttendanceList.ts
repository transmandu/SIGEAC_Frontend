import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ActivityAttendanceEmployee {
  id?: string;
  first_name: string;
  last_name: string;
  dni: string;
  /** Foto firmada del servidor de archivos; el endpoint de la actividad la incluye. */
  photo_url?: string | null;
  photo_url_lg?: string | null;
}

export interface AttendanceData {
  id: string;
  attended: boolean;
  employee_dni: string | null;
  authorized_employee_id: number | null;
  employee_type: "local" | "authorized";
  employee: ActivityAttendanceEmployee | null;
}

export const fetchAttendanceList = async ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber: string;
}): Promise<AttendanceData[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activityNumber}/attendance-list`,
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
