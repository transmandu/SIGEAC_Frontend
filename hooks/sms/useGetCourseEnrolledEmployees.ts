import axiosInstance from "@/lib/axios";
import { Employee } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface EnrolledEmployees {
  attended: Employee[];
  not_attended: Employee[];
}

const fetchGetEnrolledEmployees = async ({
  course_id,
  company,
}: {
  course_id: string;
  company: string | null;
}): Promise<EnrolledEmployees> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/enrolled-employees/${course_id}`
  );
  return data;
};

export const useGetCourseEnrolledEmployees = ({
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
  return useQuery<EnrolledEmployees>({
    queryKey: ["employees-course",course_id],
    queryFn: () => fetchGetEnrolledEmployees(value),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
