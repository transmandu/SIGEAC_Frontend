import axiosInstance from "@/lib/axios";
import { Survey } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSurveysWithoutActivity = async (
  company?: string,
): Promise<Survey[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/sms/survey-no-activity`,
  );
  return data;
};

export const useGetSurveysWithoutActivity = (company?: string) => {
  return useQuery<Survey[]>({
    queryKey: ["surveys-without-activity", company],
    queryFn: () => fetchSurveysWithoutActivity(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
