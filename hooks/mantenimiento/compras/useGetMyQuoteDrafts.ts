import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@/types/purchase";

/**
 * Los borradores de cotización del usuario autenticado, más antiguos primero.
 *
 * Un borrador es privado de quien lo creó: no aparece en el listado general de
 * cotizaciones ni para otros compradores. Sirve para el indicador de "tienes
 * trabajo sin emitir" — el borrador no se esconde, se exhibe como pendiente.
 */
const fetchMyQuoteDrafts = async (company: string | null): Promise<Quote[]> => {
  const { data } = await axiosInstance.get(`/${company}/quote/drafts`);
  return data;
};

export const useGetMyQuoteDrafts = (company: string | null) => {
  return useQuery<Quote[], Error>({
    queryKey: ["quote-drafts", company],
    queryFn: () => fetchMyQuoteDrafts(company),
    enabled: !!company,
  });
};
