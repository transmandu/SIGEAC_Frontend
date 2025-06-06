import axiosInstance from "@/lib/axios";
import { FollowUpControl, MitigationMeasure } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMeasureFollowUpControl = async (
  plan_id: string | number,
  measure_id: string | number
) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/plan/${plan_id}/measure/${measure_id}/controls`
  );
  return data;
};

export const useGetMeasureFollowUpControl = (
  plan_id: string | number,
  measure_id: string | number
) => {
  return useQuery<FollowUpControl[]>({
    // El id pertenece al plan del cual se van a extraer las medidas de mitigacion
    //queryKey: ["mitigation-measures", plan_id],
    queryKey: ["follow-up-controls"],
    queryFn: () => fetchMeasureFollowUpControl(plan_id, measure_id),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
