import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface ArticleStatusTimelineEntry {
  status: string;
  /** ISO 8601. */
  from: string;
  /** null en el tramo abierto: es el estado actual. */
  until: string | null;
  seconds: number;
  registered_by?: string | null;
  /** Solo en transiciones excepcionales: quién ordenó el pase. */
  authorized_by?: string | null;
  authorization_reason?: string | null;
}

export interface ArticleStatusHistory {
  current_status: string;
  timeline: ArticleStatusTimelineEntry[];
}

const fetchArticleStatusHistory = async (
  id: string | number,
  company?: string,
): Promise<ArticleStatusHistory> => {
  const { data } = await axios.get(`/${company}/articles/${id}/status-history`);
  return data.data;
};

export const useGetArticleStatusHistory = (
  id: string | number,
  company?: string,
  enabled = true,
) =>
  useQuery<ArticleStatusHistory>({
    queryKey: ["article-status-history", id, company],
    queryFn: () => fetchArticleStatusHistory(id, company),
    enabled: !!id && !!company && enabled,
  });
