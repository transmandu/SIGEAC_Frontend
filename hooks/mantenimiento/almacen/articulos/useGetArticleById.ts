import { EditingArticle } from "@/components/forms/mantenimiento/almacen/RegisterArticleForm";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const fetchArticleById = async (
  id: string,
  company?: string
): Promise<EditingArticle> => {
  const { data } = await axios.get(`/${company}/article/${id}`);
  return data;
};

export const useGetArticleById = (id: string, company?: string) => {
  return useQuery<EditingArticle>({
    queryKey: ["article", id, company],
    queryFn: () => fetchArticleById(id, company),
    enabled: !!id && !!company,
  });
};
