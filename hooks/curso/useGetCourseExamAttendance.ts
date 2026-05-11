import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface CourseAttendance {
  id: string | number;
  attended?: boolean;
  employee_dni: string;
  employee: {
    id?: string | number;
    first_name: string;
    last_name: string;
    dni?: string;
  };
}

interface ExamAttendance {
  id: string | number;
  employee_dni: string;
  score?: string | number | null;
  approved?: boolean | number | null;
  document_path?: string | null;
  employee?: CourseAttendance["employee"];
}

interface Props {
  company: string | undefined;
  course_id: string | undefined;
  exam_id: string | undefined;
}

export const useGetCourseExamAttendance = ({
  company,
  course_id,
  exam_id,
}: Props) => {
  return useQuery({
    queryKey: ["course-exam-attendance", company, course_id, exam_id],
    queryFn: async () => {
      const [courseAttendanceResponse, examAttendanceResponse] =
        await Promise.all([
          axiosInstance.get<CourseAttendance[]>(
            `/general/${company}/course/${course_id}/attendance-list`
          ),
          axiosInstance.get<ExamAttendance[]>(
            `/general/${company}/course-exam/${exam_id}/attendance`
          ),
        ]);

      const examAttendanceByDni = new Map(
        examAttendanceResponse.data.map((attendance) => [
          attendance.employee_dni,
          attendance,
        ])
      );

      return courseAttendanceResponse.data.map((courseAttendance) => {
        const examAttendance = examAttendanceByDni.get(
          courseAttendance.employee_dni
        );

        return {
          ...courseAttendance,
          ...examAttendance,
          id: examAttendance?.id ?? courseAttendance.id,
          row_id: examAttendance?.id ?? courseAttendance.id,
          course_attendance_id: courseAttendance.id,
          exam_attendance_id: examAttendance?.id,
          employee: examAttendance?.employee ?? courseAttendance.employee,
          employee_dni: courseAttendance.employee_dni,
        };
      });
    },
    enabled: !!company && !!course_id && !!exam_id,
  });
};
