import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface CourseExamDocument {
  exam_id: number;
  exam_name: string;
  exam_date?: string | null;
  score?: string | number | null;
  approved?: boolean | number | null;
  document_path: string;
}

interface Props {
  company?: string;
  course_id: string;
}

/**
 * Exámenes que cada participante tiene cargados (con documento) en un curso.
 * Devuelve un mapa por DNI: dni -> [{ exam, document_path, score, approved }].
 */
export const useGetCourseExamDocuments = ({ company, course_id }: Props) => {
  return useQuery({
    queryKey: ["course-exam-documents", course_id],
    queryFn: async (): Promise<Record<string, CourseExamDocument[]>> => {
      const examsResponse = await axiosInstance.get(
        `/general/${company}/course/${course_id}/exams`,
      );
      const exams = examsResponse.data;

      const attendancesResponses = await Promise.all(
        exams.map((exam: { id: number }) =>
          axiosInstance.get(
            `/general/${company}/course-exam/${exam.id}/attendance`,
          ),
        ),
      );

      const byDni: Record<string, CourseExamDocument[]> = {};

      exams.forEach(
        (
          exam: { id: number; name: string; exam_date?: string | null },
          index: number,
        ) => {
          const attendances = attendancesResponses[index].data;
          attendances.forEach(
            (attendance: {
              employee_dni: string;
              document_path?: string | null;
              score?: string | number | null;
              approved?: boolean | number | null;
            }) => {
              if (!attendance.document_path) return;
              if (!byDni[attendance.employee_dni]) {
                byDni[attendance.employee_dni] = [];
              }
              byDni[attendance.employee_dni].push({
                exam_id: exam.id,
                exam_name: exam.name,
                exam_date: exam.exam_date,
                score: attendance.score,
                approved: attendance.approved,
                document_path: attendance.document_path,
              });
            },
          );
        },
      );

      return byDni;
    },
    enabled: !!company && !!course_id,
  });
};
