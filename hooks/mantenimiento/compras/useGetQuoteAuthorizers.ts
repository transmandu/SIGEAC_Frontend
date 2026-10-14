import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { QuoteAuthorizer } from "@/types/purchase";

const fetchQuoteAuthorizers = async (
  company: string,
): Promise<QuoteAuthorizer[]> => {
  const { data } = await axios.get(`/${company}/quote-authorizers`);
  return data;
};

export const useGetQuoteAuthorizers = (company?: string) => {
  return useQuery<QuoteAuthorizer[], Error>({
    queryKey: ["quote-authorizers", company],
    queryFn: () => fetchQuoteAuthorizers(company!),
    enabled: !!company,
    // Lista cerrada definida en el backend: casi nunca cambia.
    staleTime: 30 * 60 * 1000,
  });
};
