import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type DimensionPiece = {
  id: number;
  code: string;
  remaining: number;
  /** Magnitud con que nació la pieza; permite mostrar cuánto se consumió. */
  initial: number;
  /** Cortes ya hechos, para dibujar la pieza ocupada. */
  cuts?: {
    id: number;
    cut_length: number | null;
    cut_width: number | null;
    magnitude: number;
    reason: string;
  }[];
};

export type DimensionProfile = {
  id: number;
  /** 2 = se corta por área (lámina, tela); 1 = a lo largo (cable, rollo). */
  axes: number;
  piece_length: number;
  piece_width: number | null;
  piece_magnitude: number;
  measure_unit_id: number;
  measure_unit_label: string | null;
  /** "METRO²" o "METRO", según los ejes. */
  magnitude_label: string;
};

/**
 * Unidad en que se pueden escribir las medidas de un trazo. `factor` es cuánto
 * vale 1 de esta unidad en la del perfil: 0.01 para CENTIMETRO sobre METRO.
 */
export type CaptureUnit = {
  id: number;
  label: string;
  factor: number;
};

export type ArticleDimensionResponse =
  | { dimensional: false }
  | {
      dimensional: true;
      profile: DimensionProfile;
      /** La del perfil más las equivalencias declaradas en el artículo. */
      measure_units: CaptureUnit[];
      pieces: DimensionPiece[];
      total_remaining: number;
      equivalent_pieces: number;
    };

/**
 * Los dos tipos de artículo que pueden medirse por dimensiones. El id que
 * acompaña es el `general_article_id` o, en un consumible, su `article_id`:
 * así lo direcciona el resto del módulo de almacén.
 */
export type DimensionableType = "general-articles" | "consumables";

/**
 * Estado dimensional de un artículo: si se mide por dimensiones, qué piezas
 * hay y cuánto queda en cada una. Es lo que alimenta el selector de pieza al
 * armar una salida.
 */
const fetchArticleDimension = async (
  type: DimensionableType,
  id: number | null,
  company?: string
): Promise<ArticleDimensionResponse> => {
  const { data } = await axios.get(`/${company}/articles/${type}/${id}/dimension`);
  return data;
};

export const useGetArticleDimension = (
  id: number | null,
  company?: string,
  type: DimensionableType = "general-articles"
) => {
  return useQuery<ArticleDimensionResponse, Error>({
    queryKey: ["article-dimension", company, type, id],
    queryFn: () => fetchArticleDimension(type, id, company!),
    enabled: !!id && !!company,
  });
};
