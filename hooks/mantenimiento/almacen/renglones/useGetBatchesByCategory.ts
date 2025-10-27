import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Batch } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface BatchesWithCountProp extends Batch {
  article_count: number;
}

const searchBatchesByPartNumber = async (
  category: string,
  location_id: string | null,
  company?: string
): Promise<BatchesWithCountProp[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/${location_id}/batches-by-category/${category}`
  );
  return data;
};

export const useGetBatchesByCategory = (category: string) => {
  const { selectedCompany, selectedStation } = useCompanyStore();
  return useQuery<BatchesWithCountProp[], Error>({
    queryKey: ["search-batches", selectedCompany, selectedStation, category],
    queryFn: () =>
      searchBatchesByPartNumber(
        category,
        selectedStation,
        selectedCompany?.slug
      ),
    enabled: !!selectedCompany && !!category && !!selectedStation,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
};
