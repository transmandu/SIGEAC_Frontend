import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface EnrolledEmployeeData {
  id?: string;
  first_name: string;
  last_name: string;
  dni: string;
  dni_type?: string;
  job_title: string | { id: string; name: string };
  department: string | { id: string; name: string };
  employee_type: "local" | "authorized";
  authorized_employee_id?: number | null;
  from_company_db?: string;
}

interface EmplooyesEnrolled {
  enrolled: EnrolledEmployeeData[];
  not_enrolled: EnrolledEmployeeData[];
}

const fetchGetEnrolledStatus = async ({
  company,
  activity_number,
}: {
  company: string | null;
  activity_number: string;
}): Promise<EmplooyesEnrolled> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/enrollment-status/${activity_number}`
  );
  return data;
};

export const useGetEnrolledStatus = ({
  company,
  activity_number,
}: {
  company: string | null;
  activity_number: string;
}) => {
  return useQuery<EmplooyesEnrolled>({
    queryKey: ["enrollment-status-by-activity", company, activity_number],
    queryFn: () => fetchGetEnrolledStatus({ company, activity_number }),
    enabled: !!company,
  });
};
