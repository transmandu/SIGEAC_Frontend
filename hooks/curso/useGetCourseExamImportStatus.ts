import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import type { CourseExamImport } from "@/types";

const ACTIVE_STATUSES = ["queued", "running"];

const fetchCourseExamImportStatus = async (
  company: string,
  importId: string,
): Promise<CourseExamImport> => {
  const { data } = await axiosInstance.get<{ data: CourseExamImport }>(
    `/general/${company}/course-exam-import/${importId}`,
  );

  return data.data;
};

/**
 * Consulta el avance de una carga masiva de exámenes. Solo sigue consultando
 * mientras el lote está en cola o corriendo; al terminar se detiene solo.
 */
export const useGetCourseExamImportStatus = (
  company: string | undefined,
  importId: string | null,
  enabled = true,
) => {
  return useQuery<CourseExamImport, Error>({
    queryKey: ["course-exam-import", company, importId],
    queryFn: () =>
      fetchCourseExamImportStatus(company as string, importId as string),
    enabled: !!company && !!importId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.includes(status) ? 1000 : false;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
