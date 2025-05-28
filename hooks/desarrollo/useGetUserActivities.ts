import axiosInstance from "@/lib/axios";
import { ActivityReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchUserActivity = async (id: string): Promise<ActivityReport> => {
  const { data } = await axiosInstance.get(`/transmandu/activity-report/${id}`);
  return data[0];
};

export const useGetUserActivity = (id: string) => {
  return useQuery<ActivityReport>({
    queryKey: ["user-activity", id],
    queryFn: () => fetchUserActivity(id),
    enabled: !!id,
    refetchOnMount: true,
  });
};
