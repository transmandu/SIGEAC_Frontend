import axiosInstance from "@/lib/axios";
import { Course } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCoursesByDepartment = async (
  company?: string
): Promise<Course[]> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/courses-by-department`
  );
  return data;
};

export const useGetCoursesByDeparment = (company?: string) => {
  return useQuery<Course[]>({
    queryKey: ["department-courses"],
    queryFn: () => fetchCoursesByDepartment(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
