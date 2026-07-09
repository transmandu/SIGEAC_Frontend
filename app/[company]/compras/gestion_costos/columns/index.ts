'use client'

import { ColumnDef } from '@tanstack/react-table'
import { getArticleCostColumns } from './article-cost.columns'
import { getGeneralCostColumns } from './general-cost.columns'
import type { CostType, BuildColumnsArgs } from '@/types/purchase'

export { type ArticleCostRow, type GeneralCostRow, type DraftValue } from '@/types/purchase'

export const getColumns = ({
  type,
  onCostChange,
  onViewHistory,
}: BuildColumnsArgs): ColumnDef<any>[] => {
  if (type === 'GENERAL') {
    return getGeneralCostColumns({
      onCostChange,
      onViewHistory,
    })
  }

  return getArticleCostColumns({
    onCostChange,
  })
}