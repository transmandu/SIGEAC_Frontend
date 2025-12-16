import axiosInstance from "@/lib/axios";
import { Unit } from "@/types";
import { WarehouseArticle } from "@/types/warehouse";
import { useQuery } from "@tanstack/react-query";

export type GroupBy = 'part_number' | 'batch_id';

export type GroupedArticle = {
  part_number?: string;  // Presente cuando group_by=part_number
  batch_id?: number;     // Presente cuando group_by=batch_id
  name: string;
  category: string;
  unit: Unit | null;
  article_count?: number;
  articles: WarehouseArticle[];
};

export type PaginatedArticlesByPartNumber = {
  current_page: number;
  data: GroupedArticle[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

interface FetchParams {
  company?: string;
  locationId?: string;
  page?: number;
  groupBy?: GroupBy;
}

const fetchArticlesByCategory = async ({
  company,
  locationId,
  page = 1,
  groupBy,
}: FetchParams): Promise<PaginatedArticlesByPartNumber> => {
  const { data } = await axiosInstance.get(
    `/${company}/${locationId}/articles-by-category`,
    {
      params: {
        group_by: groupBy,
        page,
      },
    }
  );
  return data;
};

export const useGetArticlesByPartNumber = (
  company?: string,
  locationId?: string,
  page: number = 1,
  groupBy: GroupBy = 'part_number'
) => {
  return useQuery<PaginatedArticlesByPartNumber>({
    queryKey: ["articles-by-category", company, locationId, page, groupBy],
    queryFn: () => fetchArticlesByCategory({ company, locationId, page, groupBy }),
    enabled: !!company && !!locationId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};