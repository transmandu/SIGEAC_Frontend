import axiosInstance from "@/lib/axios";
import { GeneralStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCourseStats = async (
  from: string,
  to: string,
  location_id: string | null,
  company?: string,
) => {
  const { data } = await axiosInstance.get(
    `/general/${company}/${location_id}/course-stats?from=${from}&to=${to}`
  );
  return data;
};

export const useGetCourseStats = (
  from: string,
  to: string,
  location_id: string | null,
  company?: string
) => {
  return useQuery<GeneralStats>({
    queryKey: ["course-stats", from, to], // Incluye el ID en la clave de la query
    queryFn: () => fetchCourseStats(from,to,location_id,company), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company && !!location_id,
  });
};
