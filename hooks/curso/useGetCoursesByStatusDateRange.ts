import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface IdNameSchema {
  id: string;
  name: string; 
}

interface data {
  from: string;
  to: string;
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
    `/general/${company}/${location_id}/course-by-status-date-range?searchStatus=${status}&from=${from}&to=${to}`
  );
  return data;
};

export const useGetCoursesByStatusDateRange = (data: data) => {
  return useQuery<IdNameSchema[]>({
    queryKey: ["course-stats"], // Incluye el ID en la clave de la query
    queryFn: () => fetchCoursesByStatusDateRange(data), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!data.company && !!data.location_id,
  });
};
