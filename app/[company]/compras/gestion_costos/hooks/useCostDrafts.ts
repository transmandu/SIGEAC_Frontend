'use client'

import { useMemo, useCallback, useState } from 'react'

type DraftValue = string | number | undefined

type UseCostDraftsArgs<T extends { id: number; cost?: number }> = {
  data: T[]
}

export function useCostDrafts<T extends { id: number; cost?: number }>({
  data,
}: UseCostDraftsArgs<T>) {

  const [drafts, setDrafts] = useState<Record<number, DraftValue>>({})

  // ⚡ directo, sin debounce, sin buffer
  const onCostChange = useCallback((id: number, value: string) => {
    setDrafts(prev => {
      if (value === '' || value == null) {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      }

      if (prev[id] === value) return prev

      return {
        ...prev,
        [id]: value,
      }
    })
  }, [])

  const resetDraft = useCallback((id: number) => {
    setDrafts(prev => {
      if (!(id in prev)) return prev
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }, [])

  const resetDrafts = useCallback(() => {
    setDrafts({})
  }, [])

  const hasChanges = useMemo(() => {
    return Object.keys(drafts).length > 0
  }, [drafts])

  const modifiedCount = useMemo(() => {
    return data.reduce((acc, item) => {
      const draft = drafts[item.id]
      if (draft === undefined) return acc

      const draftNum = Number(draft)
      const currentNum = Number(item.cost ?? 0)

      if (Number.isNaN(draftNum)) return acc

      return draftNum !== currentNum ? acc + 1 : acc
    }, 0)
  }, [data, drafts])

  const getChangedRows = useCallback(() => {
    return data
      .filter(item => {
        const draft = drafts[item.id]
        if (draft === undefined) return false

        const draftNum = Number(draft)
        const currentNum = Number(item.cost ?? 0)

        return !Number.isNaN(draftNum) && draftNum !== currentNum
      })
      .map(item => ({
        id: item.id,
        cost: Number(drafts[item.id]),
      }))
  }, [data, drafts])

  const isDirty = useCallback((id: number, current?: number) => {
    const draft = drafts[id]
    if (draft === undefined) return false
    return Number(draft) !== Number(current ?? 0)
  }, [drafts])

  return {
    drafts,
    setDrafts,
    onCostChange,
    resetDraft,
    resetDrafts,
    hasChanges,
    modifiedCount,
    isDirty,
    getChangedRows,
  }
}