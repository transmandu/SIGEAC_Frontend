import axios from "@/lib/axios";
import { SmsTrainingGroup } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSmsTrainingGroups = async (
  company: string | undefined,
): Promise<SmsTrainingGroup[]> => {
  const { data } = await axios.get(`/general/${company}/sms-training-groups`);
  return data;
};

export const useGetSmsTrainingGroups = (company: string | undefined) => {
  return useQuery<SmsTrainingGroup[], Error>({
    queryKey: ["sms-training-groups", company],
    queryFn: () => fetchSmsTrainingGroups(company),
    enabled: !!company,
  });
};
