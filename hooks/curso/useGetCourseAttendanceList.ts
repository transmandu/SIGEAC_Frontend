import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
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
  course_id,
}: {
  company?: string;
  course_id: string;
}): Promise<AttendanceData[]> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/course/${course_id}/attendance-list`
  );
  return data;
};

export const useGetCourseAttendanceList = ({
  company,
  course_id,
}: {
  company?: string;
  course_id: string;
}) => {
  return useQuery<AttendanceData[], Error>({
    queryKey: ["sms-activity-attendance-list",course_id], // Incluye el course_id en la clave
    queryFn: () => fetchAttendanceList({ company, course_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company, // Solo ejecuta si course_id tiene valor
  });
};
