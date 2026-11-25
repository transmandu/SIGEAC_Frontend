import axiosInstance from "@/lib/axios";
import type { DrillQuestionTemplate } from "@/types/sms/drill-evaluation";
import { useQuery } from "@tanstack/react-query";

/**
 * Preguntas predeterminadas del simulacro PARCIAL.
 *
 * Es una plantilla fija e independiente de los eventos. Cada evaluación
 * guarda una copia al registrarse para conservar el histórico.
 */
export const useGetDrillQuestionTemplates = ({
  company,
  enabled = true,
}: {
  company?: string;
  enabled?: boolean;
}) =>
  useQuery<DrillQuestionTemplate[]>({
    queryKey: ["drill-question-templates", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/drill-question-templates`,
      );

      return Array.isArray(data) ? (data as DrillQuestionTemplate[]) : [];
    },
    enabled: !!company && enabled,
    staleTime: 1000 * 60 * 30,
  });
