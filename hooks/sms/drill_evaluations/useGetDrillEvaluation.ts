import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { DrillEvaluation } from "@/types/sms/drill-evaluation";

/**
 * Evaluación de simulacro de una actividad. Devuelve `null` mientras la
 * actividad todavía no tiene evaluación.
 *
 * `staleTime: 0` y `refetchOnMount: "always"` son deliberados: esta consulta
 * decide si el formulario abre en modo edición (y bloquea el tipo). Con el
 * staleTime global de 60 s, una evaluación eliminada en otra pestaña o fuera
 * de la app seguía "existiendo" al navegar, y el formulario quedaba bloqueado
 * sobre un registro que ya no estaba.
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
    staleTime: 0,
    refetchOnMount: "always",
  });
