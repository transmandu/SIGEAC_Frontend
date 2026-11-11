import axiosInstance from "@/lib/axios";
import { ChangeReason } from "@/types/sms/aeronautical/change-request";
import { useQuery } from "@tanstack/react-query";

const fetchChangeReasons = async (
  company?: string,
): Promise<ChangeReason[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/aeronautical/change-reasons`,
  );
  return data;
};

export const useGetChangeReasons = (company?: string) => {
  return useQuery<ChangeReason[]>({
    queryKey: ["change-reasons", company],
    queryFn: () => fetchChangeReasons(company),
    staleTime: 1000 * 60 * 30,
    enabled: !!company,
  });
};
