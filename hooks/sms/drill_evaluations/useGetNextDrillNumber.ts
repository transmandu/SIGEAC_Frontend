import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { DrillEvaluationType } from "@/types/sms/drill-evaluation";

interface NextDrillNumberParams {
  company?: string;
  activityNumber?: string;
  type?: DrillEvaluationType;
  date?: string;
  enabled?: boolean;
}

/**
 * Correlativo sugerido (SIM-PAR/SIM-MES). staleTime corto porque otro usuario
 * puede consumir el número mientras se llena el formulario.
 */
export const useGetNextDrillNumber = ({
  company,
  activityNumber,
  type,
  date,
  enabled = true,
}: NextDrillNumberParams) =>
  useQuery<{ next_number: string }>({
    queryKey: [
      "next-drill-number",
      company,
      activityNumber,
      type,
      date ?? null,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation/next-number`,
        { params: { type, date } },
      );

      return data;
    },
    enabled: !!company && !!activityNumber && !!type && enabled,
    staleTime: 5000,
    retry: 1,
  });
