import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  dni_type: string;
  job_title: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
}

interface EmplooyesEnrolled {
  enrolled: EmployeeData[];
  not_enrolled: EmployeeData[];
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
