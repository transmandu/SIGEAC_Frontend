import axiosInstance from "@/lib/axios";
import { MitigationMeasure } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMitigationMeasure = async (plan_id: string | number) => {
  const { data } = await axiosInstance.get(
    `transmandu/sms/plan/${plan_id}/measure`
  );
  return data;
};

export const useGetMitigationMeasure = (plan_id: string | number) => {
  return useQuery<MitigationMeasure[]>({
    // El id pertenece al plan del cual se van a extraer las medidas de mitigacion
    queryKey: ["mitigation-measures"],
    queryFn: () => fetchMitigationMeasure(plan_id),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
