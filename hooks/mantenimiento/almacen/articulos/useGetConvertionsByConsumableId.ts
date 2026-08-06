import axios from "@/lib/axios";
import { Convertion } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Conversiones de un consumible, ya orientadas hacia su unidad base:
 * `base_per_unit` es cuántas unidades base hay en 1 unidad alterna.
 */
const fetchConversionByConsumableId = async (
  article_id: number | null,
  company?: string
): Promise<Convertion[]> => {
  const { data } = await axios.get(
    `/${company}/get-conversion-by-consumable?article_id=${article_id}`
  );
  return data;
};

export const useGetConversionByConsmable = (
  article_id: number | null,
  company?: string
) => {
  return useQuery<Convertion[], Error>({
    queryKey: ["conversions-by-consumable", company, article_id],
    queryFn: () => fetchConversionByConsumableId(article_id, company!),
    enabled: !!article_id && !!company,
  });
};
