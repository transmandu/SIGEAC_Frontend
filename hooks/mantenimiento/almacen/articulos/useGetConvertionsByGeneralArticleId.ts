import axios from "@/lib/axios";
import { Unit } from "@/types";
import { useQuery } from "@tanstack/react-query";


interface converionData {
  id: number;
  unit_primary: Unit;
  equivalence: number;
  unit_secondary: Unit;
}

const fetchGeneralArticleConvertion = async (
  general_article_id: number | null,
  company?: string
): Promise<converionData[]> => {
  const { data } = await axios.get(
    `/${company}/get-conversion-by-general-article`,{ params: { general_article_id } }
  );
  return data;
};

export const useGetConversionByGeneralArticle = (
  general_article_id: number | null,
  company?: string
) => {
  return useQuery<converionData[], Error>({
    queryKey: ["conversions-by-general-article", company, general_article_id],
    queryFn: () => fetchGeneralArticleConvertion(general_article_id, company!),
    enabled: !!general_article_id && !!company,
  });
};
