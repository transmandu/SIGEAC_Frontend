import axios from "@/lib/axios";
import { Unit } from "@/types";
import { ConversionDirection } from "@/types/supervisor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConvertibleType } from "./useArticleUnitConversions";

/**
 * Catálogo de equivalencias reutilizables: lo que un artículo puede COPIAR en
 * vez de teclear.
 *
 * Aplicar una sugerencia crea una conversión propia del artículo con el mismo
 * factor; no queda vínculo con el origen, así que editarla después no afecta a
 * nadie más.
 */

/** Equivalencia del catálogo curado, sin artículo dueño. */
export type UnitConversionPreset = {
  id: number;
  unit: Unit | null;
  base_unit: Unit | null;
  base_per_unit: number;
  name: string | null;
  /** Equivalencia física verificable (GALÓN↔LITRO), no de empaque. */
  is_physical: boolean;
  captured_direction?: ConversionDirection | null;
  lectura: string;
  registered_by?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
};

/**
 * Una equivalencia aplicable a un artículo. `source` dice de dónde salió, y con
 * ella qué tanto se puede confiar:
 *
 *   preset  → alguien la dio de alta a propósito en el catálogo.
 *   derived → otros artículos ya la usan; refleja el uso real, pero hereda los
 *             errores que haya en los datos.
 */
export type ConversionSuggestion = {
  source: "preset" | "derived";
  preset_id: number | null;
  unit: Unit | null;
  base_unit: Unit | null;
  base_per_unit: number;
  name: string | null;
  is_physical: boolean;
  lectura: string;
  /** Cuántos artículos usan esta misma equivalencia (0 en las del catálogo). */
  article_count: number;
  /** Algunos de esos artículos, por nombre, para poder juzgarla. */
  articles: string[];
};

export type ConversionSuggestions = {
  base_unit: Unit | null;
  suggestions: ConversionSuggestion[];
};

const presetsKey = (company?: string) => ["unit-conversion-presets", company];

/**
 * Equivalencias que este artículo puede copiar. El backend ya las filtra por su
 * unidad base y descarta las unidades que el artículo tiene resueltas: un factor
 * sólo es copiable si ambas conversiones apuntan a la misma base.
 */
export const useGetConversionSuggestions = (
  type: ConvertibleType,
  id: number | null,
  company?: string,
  enabled = true,
) =>
  useQuery<ConversionSuggestions, Error>({
    queryKey: ["unit-conversion-suggestions", company, type, id],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${company}/articles/${type}/${id}/unit-conversion-suggestions`,
      );
      return data;
    },
    enabled: !!id && !!company && enabled,
  });

export const useGetUnitConversionPresets = (company?: string) =>
  useQuery<UnitConversionPreset[], Error>({
    queryKey: presetsKey(company),
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/unit-conversion-presets`);
      return data;
    },
    enabled: !!company,
  });

/** Alta, edición y baja del catálogo curado. */
export const useMutateUnitConversionPreset = (company?: string) => {
  const queryClient = useQueryClient();

  // Las sugerencias se arman con el catálogo: tocarlo las desactualiza.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: presetsKey(company) });
    queryClient.invalidateQueries({
      queryKey: ["unit-conversion-suggestions", company],
      exact: false,
    });
  };

  const create = useMutation({
    mutationFn: async (payload: {
      unit_id: number;
      base_unit_id: number;
      direction: ConversionDirection;
      value: number;
      name?: string | null;
      is_physical?: boolean;
    }) => {
      const { data } = await axios.post(
        `/${company}/unit-conversion-presets`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      invalidate();
      toast.success("Equivalencia agregada", { description: data?.preset?.lectura });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.warning("Ya existe una equivalencia para ese par de unidades", {
          description: "Edite la que ya está en el catálogo.",
        });
        return;
      }

      toast.error("No se pudo agregar la equivalencia", {
        description: error?.response?.data?.message,
      });
    },
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number;
      direction: ConversionDirection;
      value: number;
      name?: string | null;
      is_physical?: boolean;
    }) => {
      const { data } = await axios.patch(
        `/${company}/unit-conversion-presets/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      invalidate();
      toast.success("Equivalencia actualizada", {
        description: data?.preset?.lectura,
      });
    },
    onError: (error: any) => {
      toast.error("No se pudo actualizar la equivalencia", {
        description: error?.response?.data?.message,
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await axios.delete(`/${company}/unit-conversion-presets/${id}`);
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Equivalencia eliminada del catálogo", {
        description: "Los artículos que la copiaron no se ven afectados.",
      });
    },
    onError: (error: any) => {
      toast.error("No se pudo eliminar la equivalencia", {
        description: error?.response?.data?.message,
      });
    },
  });

  return {
    createPreset: create,
    updatePreset: update,
    deletePreset: remove,
  };
};
