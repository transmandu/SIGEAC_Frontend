import { Unit, Condition } from "./index";

export type ArticleTool = {
  needs_calibration?: boolean;
  calibration_date?: string;
  next_calibration_date?: string;
  next_calibration?: number | string;
  status?: string;
};

export type ArticleComponent = {
  shell_time?: {
    caducate_date?: string | null;
    fabrication_date?: string | null;
  };
};

export type ArticleConsumable = {
  shell_time?: {
    caducate_date?: string | Date | null;
    fabrication_date?: string | Date | null;
  };
  unit?: Unit;
};

export type WarehouseArticle = {
  id: number;
  part_number: string;
  alternative_part_number?: string[];
  serial?: string;
  lot_number?: string;
  cost?: string | number;
  description?: string;
  zone: string;
  status: string;
  condition?: Condition;
  quantity: number;
  tool?: ArticleTool;
  unit?: Unit;
  min_quantity?: number | string;
  caducate_date?: string | null;
  created_at?: string;
  has_documentation?: boolean;
  certificates?: (string | null)[];
  article_type?: string;
  component?: ArticleComponent;
  consumable?: ArticleConsumable;
};
