import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { TransitUpdatesResponse } from "@/types/purchase";
import { useQuery } from "@tanstack/react-query";

/**
 * Bitácora de tránsito de un artículo. Solo se pide con el diálogo abierto y
 * sin caché: lo que otro usuario de compras anotó hace un minuto debe verse.
 */
export const transitUpdatesKey = (
  company: string | undefined,
  articleId: number,
) => ["transit-updates", company, articleId] as const;

export const useGetTransitUpdates = (articleId: number, enabled: boolean) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<TransitUpdatesResponse>({
    queryKey: transitUpdatesKey(selectedCompany?.slug, articleId),
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/articles/${articleId}/transit-updates`,
      );
      return data;
    },
    staleTime: 0,
    enabled: enabled && !!selectedCompany?.slug,
  });
};
