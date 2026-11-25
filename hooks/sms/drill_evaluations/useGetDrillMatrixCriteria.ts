import axiosInstance from "@/lib/axios";
import type { DrillMatrixCriterion } from "@/types/sms/drill-evaluation";
import { useQuery } from "@tanstack/react-query";

/**
 * Plantilla fija de la matriz de evaluación de simulacros de mesa.
 *
 * Es común a todas las evaluaciones: aquí solo se leen los criterios y sus
 * indicadores. Cada evaluación guarda una copia al registrarse.
 */
export const useGetDrillMatrixCriteria = ({
  company,
  enabled = true,
}: {
  company?: string;
  enabled?: boolean;
}) =>
  useQuery<DrillMatrixCriterion[]>({
    queryKey: ["drill-matrix-criteria", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/sms/drill-matrix-criteria`,
      );

      return Array.isArray(data) ? (data as DrillMatrixCriterion[]) : [];
    },
    enabled: !!company && enabled,
    staleTime: 1000 * 60 * 30,
  });
