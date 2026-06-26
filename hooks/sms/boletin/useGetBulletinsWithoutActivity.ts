import axiosInstance from "@/lib/axios";
import { SafetyBulletin } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBulletinsWithoutActivity = async (
  company?: string,
): Promise<SafetyBulletin[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/bulletin-no-activity`,
  );
  return data;
};

export const useGetBulletinsWithoutActivity = (company?: string) => {
  return useQuery<SafetyBulletin[]>({
    queryKey: ["bulletins-without-activity", company],
    queryFn: () => fetchBulletinsWithoutActivity(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
