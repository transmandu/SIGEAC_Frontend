import axiosInstance from "@/lib/axios";
import type { DrillEventTemplate } from "@/types/sms/drill-evaluation";
import { useQuery } from "@tanstack/react-query";

/**
 * Eventos predeterminados del simulacro PARCIAL.
 *
 * Es una plantilla fija: aquí solo se leen las descripciones. Cada evaluación
 * guarda una copia al registrarse para conservar el histórico.
 */
export const useGetDrillEventTemplates = ({
  company,
  enabled = true,
}: {
  company?: string;
  enabled?: boolean;
}) =>
  useQuery<DrillEventTemplate[]>({
    queryKey: ["drill-event-templates", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/drill-event-templates`,
      );

      return Array.isArray(data) ? (data as DrillEventTemplate[]) : [];
    },
    enabled: !!company && enabled,
    staleTime: 1000 * 60 * 30,
  });
