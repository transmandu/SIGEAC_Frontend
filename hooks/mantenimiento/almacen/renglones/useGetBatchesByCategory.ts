import axiosInstance from "@/lib/axios";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface BatchesWithCountProp extends Batch {
  article_count: number,
}

const searchBatchesByPartNumber = async (
  category: string,
  location_id: string | null,
  company: string
): Promise<BatchesWithCountProp[]> => {
  const { data } = await axiosInstance.get(`/${company}/batches-by-category`, {
    params: { location_id, category }
  });
  return data;
};

export const useSearchBatchesByPartNumber = (
  category: string,
  location_id: string | null,
  company?: string
) => {
  return useQuery<BatchesWithCountProp[], Error>({
    queryKey: ["search-batches", company, location_id, category],
    queryFn: () => searchBatchesByPartNumber(category, location_id, company!),
    enabled: !!location_id && !!category && !!company,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
