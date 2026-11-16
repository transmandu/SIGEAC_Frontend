import axios from "@/lib/axios";
import { SmsTrainingModule } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSmsTrainingModules = async (
  company: string | undefined,
): Promise<SmsTrainingModule[]> => {
  const { data } = await axios.get(`/general/${company}/sms-training-modules`);
  return data;
};

export const useGetSmsTrainingModules = (company: string | undefined) => {
  return useQuery<SmsTrainingModule[], Error>({
    queryKey: ["sms-training-modules", company],
    queryFn: () => fetchSmsTrainingModules(company),
    enabled: !!company,
  });
};
