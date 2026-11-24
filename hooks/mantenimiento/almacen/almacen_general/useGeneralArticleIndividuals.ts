import axios from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  GeneralArticleIndividual,
  IndividualsResponse,
  IndividualsSummary,
  IndividualType,
} from "@/types/general-article-individual";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Cuelga de "general-articles": toda salida, devolución o confirmación que ya
// invalida esa clave refresca también los individuales, sin tener que recordarlo.
const individualsKey = (company?: string, articleId?: number | null) => [
  "general-articles",
  company,
  "individuals",
  articleId,
];

/** Artículos individuales de un artículo general y su resumen. */
export const useGetGeneralArticleIndividuals = (
  articleId: number | null,
  enabled: boolean = true,
) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<IndividualsResponse, Error>({
    queryKey: individualsKey(selectedCompany?.slug, articleId),
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/general-articles/${articleId}/individuals`,
      );
      return data;
    },
    enabled: enabled && !!articleId && !!selectedCompany,
  });
};

/** Cualquier cambio en los individuales mueve también lo que muestran los listados. */
function useRefreshIndividuals(articleId: number) {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  return () => {
    queryClient.invalidateQueries({
      queryKey: individualsKey(selectedCompany?.slug, articleId),
    });
    queryClient.invalidateQueries({
      queryKey: ["general-articles"],
      exact: false,
    });
  };
}

export const useIndividualizeGeneralArticle = (articleId: number) => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshIndividuals(articleId);

  return useMutation({
    mutationFn: async (payload: {
      type: IndividualType;
      identifiers: string[];
    }) => {
      const { data } = await axios.post<{
        message: string;
        individuals: GeneralArticleIndividual[];
        summary: IndividualsSummary;
      }>(
        `/${selectedCompany?.slug}/general-articles/${articleId}/individuals`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      refresh();
      toast.success("¡Artículos individuales identificados!", { description: data.message });
    },
    onError: (error) =>
      notifyError(error, { action: "identificar los artículos individuales" }),
  });
};

export const useCorrectIndividualIdentifier = (articleId: number) => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshIndividuals(articleId);

  return useMutation({
    mutationFn: async ({
      id,
      identifier,
    }: {
      id: number;
      identifier: string;
    }) => {
      const { data } = await axios.patch(
        `/${selectedCompany?.slug}/general-article-individuals/${id}`,
        { identifier },
      );
      return data;
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Identificador corregido!");
    },
    onError: (error) =>
      notifyError(error, { action: "corregir el identificador" }),
  });
};

export const useDisposeIndividual = (articleId: number) => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshIndividuals(articleId);

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await axios.post(
        `/${selectedCompany?.slug}/general-article-individuals/${id}/dispose`,
        { reason },
      );
      return data;
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Artículo individual dado de baja!", {
        description:
          "Salió de la existencia del artículo y quedó el motivo registrado.",
      });
    },
    onError: (error) => notifyError(error, { action: "dar de baja el artículo individual" }),
  });
};
