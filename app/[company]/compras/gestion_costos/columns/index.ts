"use client";

import { type AppColumnDef } from "@/lib/table";
import {
  articleCostColumns,
  articleCostColumnsWithUnit,
} from "./article-cost.columns";
import { generalCostColumns } from "./general-cost.columns";
import type { CostType } from "@/types/purchase";

export {
  type ArticleCostRow,
  type GeneralCostRow,
  type DraftValue,
} from "@/types/purchase";

/**
 * Elige el conjunto de columnas del tipo activo. Devuelve siempre la misma
 * constante para cada combinación: no construye nada, así que su identidad es
 * estable entre renders.
 */
export const selectCostColumns = (
  type: CostType,
  category?: string,
): AppColumnDef<any>[] => {
  if (type === "GENERAL") return generalCostColumns;

  // La unidad solo es relevante para Consumibles en aeronáutico
  return category === "CONSUMABLE"
    ? articleCostColumnsWithUnit
    : articleCostColumns;
};
