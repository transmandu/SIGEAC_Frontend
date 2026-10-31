import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { ExternalEmployee } from "./types";

/**
 * Personas externas con al menos una salida en la sede, estén autorizadas o
 * activas hoy o no. Es lo que ofrecen los filtros de los reportes de salidas:
 * quien tiene registros tiene que poder filtrarse.
 */
export const useGetDispatchReportExternalEmployees = (
  companySlug: string | undefined,
  locationId: string | number | undefined,
) =>
  useQuery<ExternalEmployee[]>({
    queryKey: ["dispatch-report-external-employees", companySlug, locationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/${locationId}/dispatch-report/external-employees`,
      );
      return data;
    },
    enabled: !!companySlug && !!locationId,
  });
