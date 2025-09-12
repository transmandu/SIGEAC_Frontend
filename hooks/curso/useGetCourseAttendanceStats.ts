import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

interface CourseAttendanceStats {
  attended: number;
  not_attended: number;
  total: number;
  attended_percentage: number;
  not_attended_percentage: number;
}

const fetchCourseAttendanceStats = async (course_id: string, company?: string) => {
  const { data } = await axiosInstance.get(
    `general/${company}/course/${course_id}/attendance-stats`
  );
  return data;
};

export const useGetCourseAttendanceStats = (course_id: string) => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<CourseAttendanceStats>({
    queryKey: ["course-attendance-stats"], // Incluye el ID en la clave de la query
    queryFn: () => fetchCourseAttendanceStats(course_id, selectedCompany?.slug), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug,
  });
};
