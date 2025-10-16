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
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}): Promise<EmplooyesEnrolled> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/enrollment-status/${activity_id}`
  );
  return data;
};

export const useGetEnrolledStatus = ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}) => {
  return useQuery<EmplooyesEnrolled>({
    queryKey: ["enrollment-status-by-activity",activity_id],
    queryFn: () => fetchGetEnrolledStatus({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
