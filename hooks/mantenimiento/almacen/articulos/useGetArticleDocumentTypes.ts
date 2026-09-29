import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface ArticleDocumentType {
  id: number;
  name: string;
  description?: string | null;
  regulation?: string | null;
}

const fetchArticleDocumentTypes = async (company: string | undefined): Promise<ArticleDocumentType[]> => {
  const { data } = await axios.get(`/${company}/article-document-types`);
  return data;
};

export const useGetArticleDocumentTypes = (company: string | undefined) => {
  return useQuery<ArticleDocumentType[]>({
    queryKey: ["article-document-types", company],
    queryFn: () => fetchArticleDocumentTypes(company),
    enabled: !!company,
    // Catálogo maestro: cambia cuando alguien edita los tipos, no durante una
    // sesión de trabajo. Sin esto se volvía a pedir cada vez que se abría una
    // ficha, y el selector aparecía cargando sobre datos que ya estaban.
    staleTime: 1000 * 60 * 30,
  });
};
