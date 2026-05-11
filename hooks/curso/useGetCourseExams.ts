import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface Exam {
  id: number;
  course_id: number;
  name: string;
  description: string;
  exam_date: string;
  registered_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  attendances: any[];
}

interface Props {
  course_id: string;
  company: string | undefined;
}

export const useGetCourseExams = ({ course_id, company }: Props) => {
  return useQuery({
    queryKey: ["course-exams", course_id],
    queryFn: async (): Promise<Exam[]> => {
      const response = await axiosInstance.get(
        `/general/${company}/course/${course_id}/exams`
      );
      return response.data;
    },
    enabled: !!company && !!course_id,
  });
};
