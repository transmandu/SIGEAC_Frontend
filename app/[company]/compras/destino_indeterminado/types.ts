export type DestinationArticle = {
  id: number;
  part_number?: string | null;
  alternative_part_number?: string | null;
  serial?: string | null;
  article_type?: string | null;
  description?: string | null;
  status?: string | null;
  quantity?: number | null;
  unit?: string | null;
  batch?: {
    id: number;
    name?: string | null;
    warehouse?: {
      id: number;
      name?: string | null;
      location?: {
        id: number;
        address?: string | null;
        cod_iata?: string | null;
      } | null;
    } | null;
  } | null;
  condition?: {
    id: number;
    name?: string | null;
  } | null;
  manufacturer?: {
    id: number;
    name?: string | null;
  } | null;
};
