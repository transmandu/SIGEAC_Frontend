import axios from "@/lib/axios";
import { Unit } from "@/types";
import { useQuery } from "@tanstack/react-query";


interface converionData {
  id: number;
  unit_primary: Unit;
  equivalence: number;
  unit_secondary: Unit;
}

const fetchConversionByConsumableId = async (
  article_id: number | null,
  company?: string
): Promise<converionData[]> => {
  const { data } = await axios.get(
    `/${company}/get-conversion-by-consumable?article_id=${article_id}`
  );
  return data;
};

export const useGetConversionByConsmable = (
  article_id: number | null,
  company?: string
) => {
  return useQuery<converionData[], Error>({
    queryKey: ["conversions-by-consumable", company, article_id],
    queryFn: () => fetchConversionByConsumableId(article_id, company!),
    enabled: !!article_id && !!company,
  });
};
