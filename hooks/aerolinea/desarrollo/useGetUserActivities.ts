import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchUserActivity = async (id: string, company?: string): Promise<ActivityReport> => {
  const { data } = await axiosInstance.get(`/${company}/activity-report/${id}`);
  return data[0];
};

export const useGetUserActivity = (id: string, company?: string) => {
  return useQuery<ActivityReport>({
    queryKey: ["user-activity", id],
    queryFn: () => fetchUserActivity(id, company  ),
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID y una compañía
    refetchOnMount: true,
  });
};
