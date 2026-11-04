import axios from "@/lib/axios";
import { SmsTrainingGroupEmployee } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSmsTrainingGroupEmployees = async (
  company: string | undefined,
  groupId: number,
): Promise<SmsTrainingGroupEmployee[]> => {
  const { data } = await axios.get(
    `/general/${company}/sms-training-groups/${groupId}/employees`,
  );
  return data;
};

export const useGetSmsTrainingGroupEmployees = (
  company: string | undefined,
  groupId: number,
  enabled = true,
) => {
  return useQuery<SmsTrainingGroupEmployee[], Error>({
    queryKey: ["sms-training-group-employees", company, groupId],
    queryFn: () => fetchSmsTrainingGroupEmployees(company, groupId),
    enabled: enabled && !!company && !!groupId,
  });
};
