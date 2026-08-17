import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface IdNameSchema {
  id: string;
  name: string;
  description: string;
}

interface data {
  from: string | null;
  to: string | null;
  status: string;
  company?: string;
  location_id: string;
}

const fetchCoursesByStatusDateRange = async ({
  from,
  to,
  status,
  company,
  location_id,
}: data) => {
  const { data } = await axiosInstance.get(
    `/general/${company}/${location_id}/courses-by-status-date-range?searchStatus=${status}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetCoursesByStatusDateRange = (data: data) => {
  return useQuery<IdNameSchema[]>({
    queryKey: ["course-stats"],
    queryFn: () => fetchCoursesByStatusDateRange(data),
    staleTime: 1000 * 60 * 5,
    enabled: !!data.company && !!data.location_id,
  });
};
