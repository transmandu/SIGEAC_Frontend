import axiosInstance from "@/lib/axios";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface BatchesWithCountProp extends Batch {
  article_count: number,
}

const searchBatchesByPartNumber = async (
  company: string,
  location_id: string,
  part_number: string
): Promise<BatchesWithCountProp[]> => {
  const { data } = await axiosInstance.get(`/${company}/search-by-part`, {
    params: { location_id, part_number }
  });
  return data;
};

export const useSearchBatchesByPartNumber = (
  company?: string,
  location_id?: string,
  part_number?: string
) => {
  return useQuery<BatchesWithCountProp[], Error>({
    queryKey: ["search-batches", company, location_id, part_number],
    queryFn: () => searchBatchesByPartNumber(company!, location_id!, part_number!),
    enabled: !!company && !!location_id && !!part_number,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
