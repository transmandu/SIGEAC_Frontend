import axios from "@/lib/axios";
import { Convertion, Unit } from "@/types";
import { ConversionDirection } from "@/types/supervisor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Conversiones de UN artículo. Reemplaza al catálogo global de conversiones:
 * cada fila pertenece a este artículo y editarla no afecta a ningún otro.
 *
 * `type` distingue el tipo de artículo; `id` es el general_article_id o, para
 * consumibles, el article_id (igual que el resto del módulo de almacén).
 */
export type ConvertibleType = "general-articles" | "consumables";

export type ArticleUnitConversions = {
  base_unit: Unit | null;
  conversions: Convertion[];
};

const conversionsKey = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
) => ["article-unit-conversions", company, type, id];

const fetchConversions = async (
  type: ConvertibleType,
  id: number,
  company: string,
): Promise<ArticleUnitConversions> => {
  const { data } = await axios.get(
    `/${company}/articles/${type}/${id}/unit-conversions`,
  );
  return data;
};

export const useGetArticleUnitConversions = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
) =>
  useQuery<ArticleUnitConversions, Error>({
    queryKey: conversionsKey(type, id, company),
    queryFn: () => fetchConversions(type, id!, company!),
    enabled: !!id && !!company,
  });

/**
 * El backend responde 409 con `created: false` cuando el artículo ya tiene una
 * conversión para esa unidad: nunca duplica ni sobrescribe en silencio, así que
 * aquí se distingue ese caso de un error real para poder decírselo al usuario.
 */
export const useCreateArticleUnitConversion = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      unit_id: number;
      direction: ConversionDirection;
      value: number;
    }) => {
      const { data } = await axios.post(
        `/${company}/articles/${type}/${id}/unit-conversions`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversionsKey(type, id, company) });
      toast.success("Conversión creada", { description: data?.conversion?.lectura });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        toast.warning("Ya existe una conversión para esa unidad", {
          description: "Edite la conversión existente en vez de crear otra.",
        });
        return;
      }

      toast.error("No se pudo crear la conversión", { description: message });
    },
  });
};

export const useUpdateArticleUnitConversion = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversionId,
      ...payload
    }: {
      conversionId: number;
      direction: ConversionDirection;
      value: number;
    }) => {
      const { data } = await axios.patch(
        `/${company}/articles/${type}/${id}/unit-conversions/${conversionId}`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversionsKey(type, id, company) });
      toast.success("Conversión actualizada", { description: data?.conversion?.lectura });
    },
    onError: (error: any) => {
      toast.error("No se pudo actualizar la conversión", {
        description: error?.response?.data?.message,
      });
    },
  });
};

export const useDeleteArticleUnitConversion = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversionId: number) => {
      const { data } = await axios.delete(
        `/${company}/articles/${type}/${id}/unit-conversions/${conversionId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversionsKey(type, id, company) });
      toast.success("Conversión eliminada");
    },
    onError: (error: any) => {
      toast.error("No se pudo eliminar la conversión", {
        description: error?.response?.data?.message,
      });
    },
  });
};
