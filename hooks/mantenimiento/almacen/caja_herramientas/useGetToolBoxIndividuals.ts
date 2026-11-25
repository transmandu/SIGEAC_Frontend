import axios from "@/lib/axios";
import type { ToolBoxIndividual } from "@/types/general-article-individual";
import { useQuery } from "@tanstack/react-query";

/**
 * Herramientas de ferretería identificadas que pueden guardarse en una caja:
 * sueltas en el almacén de la sede y sin caja asignada.
 */
export const useGetToolBoxIndividuals = (
  location_id: string | number | null,
  company?: string,
) =>
  useQuery<ToolBoxIndividual[], Error>({
    queryKey: ["tool-box-individuals", company, location_id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/${location_id}/tool-box-individuals`,
      );
      return data;
    },
    enabled: !!company && !!location_id,
  });
