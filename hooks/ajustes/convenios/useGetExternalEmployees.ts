import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { CompanyScope, ExternalEmployee } from "./types";

/**
 * Personas de otras empresas que pueden actuar en `companySlug` dentro de un
 * alcance: las elegidas una a una y las de los departamentos elegidos. Con
 * `"all"`, las de todos los alcances abiertos.
 *
 * `at` (`YYYY-MM-DD`) las evalúa a esa fecha en vez de hoy: al editar un
 * registro antiguo se ofrece a quien entonces estaba autorizado.
 */
export const useGetExternalEmployees = (
  companySlug: string | undefined,
  scope: CompanyScope | "all",
  at?: string,
) =>
  useQuery<ExternalEmployee[]>({
    queryKey: ["external-employees", companySlug, scope, at ?? null],
    queryFn: async () => {
      const { data } = await axios.get(`/${companySlug}/external-employees`, {
        params: {
          ...(scope === "all" ? {} : { scope }),
          ...(at ? { at } : {}),
        },
      });

      return data;
    },
    enabled: !!companySlug,
  });
