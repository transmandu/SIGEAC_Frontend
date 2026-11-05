import axiosInstance from "@/lib/axios";
import { CourseUploadedCertificate } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCourseUploadedCertificates = async (
  company: string | undefined,
  courseId: string | number,
): Promise<CourseUploadedCertificate[]> => {
  const { data } = await axiosInstance.get(
    `/general/${company}/course/${courseId}/certificates/uploaded`,
  );
  return data;
};

export const useGetCourseUploadedCertificates = (
  company: string | undefined,
  courseId: string | number,
  enabled = true,
) => {
  return useQuery<CourseUploadedCertificate[], Error>({
    queryKey: ["course-uploaded-certificates", company, courseId],
    queryFn: () => fetchCourseUploadedCertificates(company, courseId),
    enabled: enabled && !!company && !!courseId,
  });
};
