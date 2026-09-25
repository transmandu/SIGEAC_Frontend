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
  locationId: string,
  range: DateRange,
): Promise<ReceptionHistoryResponse> => {
  const { data } = await axiosInstance.get(
    `/${company}/${locationId}/articles-reception-history`,
    { params: { date_from: range.from, date_to: range.to } },
  );
  return data;
};

export const useGetReceptionHistory = (range: DateRange = {}) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<ReceptionHistoryResponse>({
    queryKey: [
      "reception-history",
      selectedCompany?.slug,
      selectedStation,
      range.from,
      range.to,
    ],
    queryFn: () =>
      fetchReceptionHistory(selectedCompany!.slug, selectedStation!, range),
    enabled: !!selectedCompany?.slug && !!selectedStation,
    // Filtrar cambia la queryKey; sin esto la vista vuelve al loader.
    placeholderData: keepPreviousData,
  });
};
