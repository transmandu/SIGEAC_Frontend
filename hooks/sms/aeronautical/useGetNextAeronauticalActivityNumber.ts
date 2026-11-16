import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface NextActivityNumber {
  next_number: string;
}

// Correlativo sugerido. staleTime corto porque otro usuario puede consumir el
// número mientras se llena el formulario.
export const useGetNextAeronauticalActivityNumber = (
  company: string | null,
) => {
  return useQuery<NextActivityNumber>({
    queryKey: ["next-aeronautical-activity-number", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/aeronautical/next-activity-number`,
      );
      return data;
    },
    enabled: !!company,
    staleTime: 5000,
    retry: 1,
  });
};
