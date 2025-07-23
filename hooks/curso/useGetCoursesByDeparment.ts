import axiosInstance from "@/lib/axios";
import { Course } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCoursesByDepartment = async (
  { company, department }: { company?: string, department?: string }
): Promise<Course[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/courses-by-department/${department}`
  );
  return data;
};

export const useGetCoursesByDeparment = ({ company, department }: { company?: string, department?: string }) => {
  return useQuery<Course[]>({
    queryKey: ["department-courses"],
    queryFn: () => fetchCoursesByDepartment({company, department}),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!department,
  });
};
