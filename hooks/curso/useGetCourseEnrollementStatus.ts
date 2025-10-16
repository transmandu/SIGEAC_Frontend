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

const fetchGetCourseEnrollementStatus = async ({
  course_id,
  company,
}: {
  course_id: string;
  company: string | null;
}): Promise<EmplooyesEnrolled> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/enrollement-status/${course_id}`
  );
  return data;
};

export const useGetCourseEnrollementStatus = ({
  course_id,
  company,
}: {
  company: string | null;
  course_id: string;
}) => {
  const value = {
    course_id: course_id,
    company: company,
  };
  return useQuery<EmplooyesEnrolled>({
    queryKey: ["enrollment-status-by-course",course_id],
    queryFn: () => fetchGetCourseEnrollementStatus(value),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
