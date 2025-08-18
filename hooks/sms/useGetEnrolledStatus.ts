import axiosInstance from "@/lib/axios";
import { EmplooyesEnrolled } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchGetEnrolledStatus = async ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}): Promise<EmplooyesEnrolled> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/enrollment-status/${activity_id}`
  );
  return data;
};

export const useGetEnrolledStatus = ({
  company,
  activity_id,
}: {
  company: string | null;
  activity_id: string;
}) => {
  return useQuery<EmplooyesEnrolled>({
    queryKey: ["enrollment-status"],
    queryFn: () => fetchGetEnrolledStatus({ company, activity_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
