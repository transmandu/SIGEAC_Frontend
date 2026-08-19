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
 *
 * Vive en hooks/ pese a incluir mutaciones: la lectura y su CRUD se usan
 * siempre juntos desde el mismo diálogo.
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

/**
 * Las conversiones de un artículo se leen desde tres claves distintas (la del
 * CRUD, la del panel de despacho y la del registro global). Tras escribir hay
 * que invalidarlas todas: refrescar sólo la propia dejaba el panel de despacho
 * mostrando "sin conversiones" hasta recargar la página.
 */
const invalidateConversions = (
  queryClient: ReturnType<typeof useQueryClient>,
  company?: string,
) => {
  [
    "article-unit-conversions",
    "conversions-by-general-article",
    "conversions-by-consumable",
    "unit-conversions",
  ].forEach((key) =>
    queryClient.invalidateQueries({ queryKey: [key, company], exact: false }),
  );
};

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

/** Una conversión del tenant junto al artículo al que pertenece. */
export type UnitConversionRow = {
  id: number;
  convertible_type: "general_article" | "consumable";
  convertible_id: number;
  /** Id con el que se direcciona el artículo en el resto del módulo. */
  route_id?: number | string;
  /**
   * Nombre real del artículo y su precisión. En consumibles es el renglón
   * (batch.name) con su número de parte; en generales, la descripción con
   * variante y marca.
   */
  article: { name?: string | null; detail?: string | null } | null;
  base_unit: Unit | null;
  unit: Unit | null;
  base_per_unit: number;
  lectura: string | null;
  /**
   * La equivalencia en la dirección en que se declaró. Es la que se muestra:
   * la literal se vuelve ilegible cuando el factor cae por debajo de 1
   * ("1 YARDA = 0.027777777778 UNIDAD" por "1 UNIDAD = 36 YARDAS").
   */
  lectura_legible?: string | null;
  captured_direction?: ConversionDirection | null;
  /** El artículo dueño ya no existe: la fila quedó colgada. */
  orphaned: boolean;
  registered_by?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

/** Todas las conversiones del tenant, para el panel de revisión. */
export const useGetAllUnitConversions = (company?: string) =>
  useQuery<UnitConversionRow[], Error>({
    queryKey: ["unit-conversions", company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/unit-conversions`);
      return data;
    },
    enabled: !!company,
  });

/**
 * Edita o elimina una conversión desde el panel global, donde el artículo se
 * conoce por la fila y no por la ruta en que se está navegando.
 */
export const useMutateUnitConversionRow = (company?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => invalidateConversions(queryClient, company);

  const pathFor = (row: UnitConversionRow) =>
    `/${company}/articles/${
      row.convertible_type === "consumable" ? "consumables" : "general-articles"
    }/${row.route_id ?? row.convertible_id}/unit-conversions/${row.id}`;

  const update = useMutation({
    mutationFn: async ({
      row,
      ...payload
    }: {
      row: UnitConversionRow;
      direction: ConversionDirection;
      value: number;
    }) => {
      const { data } = await axios.patch(pathFor(row), payload);
      return data;
    },
    onSuccess: (data) => {
      invalidate();
      toast.success("Conversión actualizada", {
        description: data?.conversion?.lectura,
      });
    },
    onError: (error: any) => {
      toast.error("No se pudo actualizar la conversión", {
        description: error?.response?.data?.message,
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (row: UnitConversionRow) => {
      const { data } = await axios.delete(pathFor(row));
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Conversión eliminada");
    },
    onError: (error: any) => {
      toast.error("No se pudo eliminar la conversión", {
        description: error?.response?.data?.message,
      });
    },
  });

  return { updateConversion: update, deleteConversion: remove };
};

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
      invalidateConversions(queryClient, company);
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
      invalidateConversions(queryClient, company);
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
      invalidateConversions(queryClient, company);
      toast.success("Conversión eliminada");
    },
    onError: (error: any) => {
      toast.error("No se pudo eliminar la conversión", {
        description: error?.response?.data?.message,
      });
    },
  });
};
