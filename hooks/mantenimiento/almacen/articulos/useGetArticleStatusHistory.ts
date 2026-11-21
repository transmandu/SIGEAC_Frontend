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

/**
 * Algo que le pasó al artículo sin cambiar su estado: otra llegada de su compra
 * que se le unió (`MERGE`) o una recepción parcial (`PARTIAL_RECEPTION`).
 */
export interface ArticleHistoryEvent {
  type: "MERGE" | "PARTIAL_RECEPTION";
  /** ISO 8601. */
  at: string;
  text: string | null;
  registered_by: string | null;
}

/** Una llegada que se unió a este artículo y conserva su propio camino. */
export interface MergedArrival {
  id: number;
  quantity: number | null;
  unit: string | null;
  received_at: string | null;
  timeline: ArticleStatusTimelineEntry[];
  events: ArticleHistoryEvent[];
}

export interface ArticleStatusHistory {
  current_status: string;
  timeline: ArticleStatusTimelineEntry[];
  events: ArticleHistoryEvent[];
  /** Si este artículo se unió a otro: a cuál. */
  merged_into: { id: number; part_number: string | null } | null;
  merged_articles: MergedArrival[];
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
