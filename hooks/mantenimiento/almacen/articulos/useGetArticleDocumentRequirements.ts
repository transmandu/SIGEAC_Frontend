import axios from '@/lib/axios';
import type { ArticleDocumentRequirementSummary } from '@/types';
import { useQuery } from '@tanstack/react-query';

/** Forma cruda del backend: relaciones en camelCase de Eloquent. */
type RawRequirement = {
  id: number;
  document_type?: { id: number; name: string; regulation: string | null } | null;
  documentType?: { id: number; name: string; regulation: string | null } | null;
  documents?: {
    id: number;
    file_path: string | null;
    file_url: string | null;
    is_physical: boolean | number;
  }[];
};

const fetchArticleDocumentRequirements = async (
  articleId: string | number | undefined,
  company: string | undefined
): Promise<ArticleDocumentRequirementSummary[]> => {
  const { data } = await axios.get<RawRequirement[]>(
    `/${company}/articles/${articleId}/document-requirements`
  );

  return (data ?? []).map((req) => ({
    id: req.id,
    document_type: req.document_type ?? req.documentType ?? null,
    documents: (req.documents ?? []).map((doc) => ({
      id: doc.id,
      file_path: doc.file_path,
      file_url: doc.file_url,
      is_physical: Boolean(doc.is_physical),
    })),
  }));
};

/**
 * Checklist documental de un artículo, cargado bajo demanda (la tabla de
 * inventario está paginada y no arrastra los documentos de cada fila).
 */
export const useGetArticleDocumentRequirements = (
  articleId: string | number | undefined,
  company: string | undefined,
  enabled = true
) => {
  return useQuery<ArticleDocumentRequirementSummary[]>({
    queryKey: ['article-document-requirements', articleId, company],
    queryFn: () => fetchArticleDocumentRequirements(articleId, company),
    enabled: !!articleId && !!company && enabled,
  });
};
