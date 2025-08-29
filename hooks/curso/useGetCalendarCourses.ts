import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

interface calendarCourse {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
}

const fetchCourseForCalendar = async (
  company?: string
): Promise<calendarCourse[]> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/course-calendar`
  );
  return data;
};

export const useGetCoursesForCalendar = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<calendarCourse[]>({
    queryKey: ["course-calendar"],
    queryFn: () => fetchCourseForCalendar(selectedCompany?.slug),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!selectedCompany?.slug,
  });
};
