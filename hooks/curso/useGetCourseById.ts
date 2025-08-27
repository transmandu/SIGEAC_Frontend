import axiosInstance from "@/lib/axios";
import { Course } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCoursesById = async ({
  id,
  company,
}: {
  id: string;
  company?: string;
}): Promise<Course> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/course-by/${id}`
  );
  return data;
};

export const useGetCourseById = ({
  id,
  company,
}: {
  id: string;
  company?: string;
}) => {
  const value = {
    id: id,
    company: company,
  };
  return useQuery<Course>({
    queryKey: ["course-by-id", company],
    queryFn: () => fetchCoursesById(value),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
