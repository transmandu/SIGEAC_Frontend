import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface EmployeeAttendanceData {
  dni: string;
  first_name: string;
  last_name: string;
  job_title: { name: string };
  department: { name: string };
  employee_type: "local" | "authorized";
  authorized_employee_id?: number | null;
  from_company_db?: string;
}

interface EnrolledEmployees {
  attended: EmployeeAttendanceData[];
  not_attended: EmployeeAttendanceData[];
}

const fetchGetActivityAttendanceStatus = async ({
  activity_number,
  company,
}: {
  activity_number: string;
  company: string | null;
}): Promise<EnrolledEmployees> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/activities/${activity_number}/employee-attendance-status`
  );
  return data;
};

export const useGetSMSActivityAttendanceStatus = ({
  activity_number,
  company,
}: {
  company: string | null;
  activity_number: string;
}) => {
  const value = {
    activity_number: activity_number,
    company: company,
  };
  return useQuery<EnrolledEmployees>({
    queryKey: ["sms-activity-attendance-status", activity_number],
    queryFn: () => fetchGetActivityAttendanceStatus(value),
    staleTime: 1000 * 60 * 5,
  });
};
