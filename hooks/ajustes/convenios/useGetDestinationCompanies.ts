import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { DestinationCompany } from "./types";

/**
 * Empresas a las que se puede atribuir lo que retira una persona externa: esta,
 * la suya y las que tienen convenio con ambas. `at` (`YYYY-MM-DD`) las evalúa a
 * esa fecha en vez de hoy.
 */
export const useGetDestinationCompanies = (
  companySlug: string | undefined,
  authorizedEmployeeId: string | number | undefined,
  at?: string,
) =>
  useQuery<DestinationCompany[]>({
    queryKey: [
      "destination-companies",
      companySlug,
      authorizedEmployeeId,
      at ?? null,
    ],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${companySlug}/external-employees/${authorizedEmployeeId}/destination-companies`,
        { params: at ? { at } : {} },
      );

      return data;
    },
    enabled: !!companySlug && !!authorizedEmployeeId,
  });
