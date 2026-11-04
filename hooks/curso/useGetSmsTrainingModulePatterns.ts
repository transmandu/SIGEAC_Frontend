import axios from "@/lib/axios";
import { SmsTrainingModulePattern } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSmsTrainingModulePatterns = async (
  company: string | undefined,
): Promise<SmsTrainingModulePattern[]> => {
  const { data } = await axios.get(
    `/general/${company}/sms-training-module-patterns`,
  );
  return data;
};

export const useGetSmsTrainingModulePatterns = (
  company: string | undefined,
) => {
  return useQuery<SmsTrainingModulePattern[], Error>({
    queryKey: ["sms-training-module-patterns", company],
    queryFn: () => fetchSmsTrainingModulePatterns(company),
    enabled: !!company,
  });
};
