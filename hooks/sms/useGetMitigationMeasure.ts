import axiosInstance from "@/lib/axios";
import { MitigationMeasure } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMitigationMeasure = async ({
  company,
  plan_id,
}: {
  company?: string;
  plan_id: string;
}) => {
  const { data } = await axiosInstance.get(
    `${company}/sms/plan/${plan_id}/measure`
  );
  return data;
};

export const useGetMitigationMeasure = ({
  company,
  plan_id,
}: {
  company?: string;
  plan_id: string;
}) => {
  return useQuery<MitigationMeasure[]>({
    queryKey: ["mitigation-measures"],
    queryFn: () => fetchMitigationMeasure({ company, plan_id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
