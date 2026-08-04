import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type AeronauticalReception = {
  id: number;
  part_number: string | null;
  description: string | null;
  status: string | null;
  reception_date: string;
  quantity: number;
  unit: string;
  sender: string | null;
  origin: string | null;
  destination: string | null;
  order_number: string | null;
  vendor: string | null;
};

export type ReceptionHistoryResponse = {
  articles: AeronauticalReception[];
  statistics: {
    total: number;
    by_month: Record<string, number>;
    top_articles: Record<string, number>;
    top_vendors: Record<string, number>;
  };
};

type DateRange = {
  from?: string;
  to?: string;
};

const fetchReceptionHistory = async (
  company: string,
  range: DateRange,
): Promise<ReceptionHistoryResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/articles-reception-history`,
    { params: { date_from: range.from, date_to: range.to } },
  );
  return data;
};

export const useGetReceptionHistory = (range: DateRange = {}) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<ReceptionHistoryResponse>({
    queryKey: [
      "reception-history",
      selectedCompany?.slug,
      range.from,
      range.to,
    ],
    queryFn: () => fetchReceptionHistory(selectedCompany!.slug, range),
    enabled: !!selectedCompany?.slug,
    // Filtrar cambia la queryKey; sin esto la vista vuelve al loader.
    placeholderData: keepPreviousData,
  });
};
