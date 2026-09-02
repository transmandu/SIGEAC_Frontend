import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

export interface ArticleReturnContext {
  condition: "SEALED" | "ALTERED";
  justification: string | null;
  returned_by: string | null;
  returned_at: string | null;
  /** Puede venir vacío: adjuntar fotos es opcional. */
  evidences: {
    id: number;
    url: string | null;
    uploaded_by: string | null;
  }[];
}

const fetchReturnContext = async (
  articleId: number,
  company?: string
): Promise<ArticleReturnContext | null> => {
  const { data } = await axios.get(
    `/${company}/articles/${articleId}/return-evidences`
  );
  return data.data;
};

/**
 * La devolución que mandó este artículo a inspección: por qué volvió, quién lo
 * devolvió y las fotos de cómo llegó.
 *
 * Es lo que el inspector necesita en incoming: la pieza llega sin orden de
 * compra ni factura, así que lo único que explica su presencia es lo que
 * declaró el almacén. Devuelve `null` cuando el artículo llegó por la vía
 * normal.
 */
export const useGetArticleReturnContext = (
  articleId: number | null,
  enabled = true
) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<ArticleReturnContext | null, Error>({
    queryKey: ["article-return-context", articleId],
    queryFn: () => fetchReturnContext(articleId!, selectedCompany?.slug),
    enabled: !!selectedCompany && !!articleId && enabled,
  });
};
