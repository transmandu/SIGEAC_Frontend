import axios from "@/lib/axios";
import { Convertion } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Conversiones de un artículo general, ya orientadas hacia su unidad base:
 * `base_per_unit` es cuántas unidades base hay en 1 unidad alterna.
 */
const fetchGeneralArticleConvertion = async (
  general_article_id: number | null,
  company?: string
): Promise<Convertion[]> => {
  const { data } = await axios.get(
    `/${company}/get-conversion-by-general-article`,{ params: { general_article_id } }
  );
  return data;
};

export const useGetConversionByGeneralArticle = (
  general_article_id: number | null,
  company?: string
) => {
  return useQuery<Convertion[], Error>({
    queryKey: ["conversions-by-general-article", company, general_article_id],
    queryFn: () => fetchGeneralArticleConvertion(general_article_id, company!),
    enabled: !!general_article_id && !!company,
  });
};
