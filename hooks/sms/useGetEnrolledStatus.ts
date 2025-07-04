import axiosInstance from "@/lib/axios";
import { EmplooyesEnrolled } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchGetEnrolledStatus = async (
  activity_id: number
): Promise<EmplooyesEnrolled> => {
  const { data } = await axiosInstance.get(
    `/transmandu/sms/enrollment-status/${activity_id}`
  );
  return data;
};

export const useGetEnrolledStatus = (activity_id: number) => {
  return useQuery<EmplooyesEnrolled>({
    queryKey: ["enrollment-status"],
    queryFn: () => fetchGetEnrolledStatus(activity_id),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
