import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { DrillEvaluation } from "@/types/sms/drill-evaluation";

/**
 * Evaluación de simulacro de una actividad. Devuelve `null` mientras la
 * actividad todavía no tiene evaluación.
 */
export const useGetDrillEvaluation = ({
  company,
  activityNumber,
}: {
  company?: string;
  activityNumber?: string;
}) =>
  useQuery<DrillEvaluation | null>({
    queryKey: ["drill-evaluation", company, activityNumber],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation`,
      );

      return data;
    },
    enabled: !!company && !!activityNumber,
  });
