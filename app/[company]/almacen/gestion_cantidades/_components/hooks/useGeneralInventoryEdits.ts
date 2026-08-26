"use client"

import { useCallback, useMemo, useState } from "react"
import { GeneralArticle } from "@/types"

type EditedState = Record<number, number | undefined>

export function useGeneralInventoryEdits(articles: GeneralArticle[]) {
  const baseQuantities = useMemo(() => {
    const map: Record<number, number> = {}
    for (const a of articles) map[a.id] = Number(a.quantity ?? 0)
    return map
  }, [articles])

  const [editedQuantities, setEditedQuantities] = useState<EditedState>({})

  const setQuantity = useCallback((id: number, value: string) => {
    const cleaned = value.replace(/[^\d]/g, "")

    setEditedQuantities((prev) => {
      const next = { ...prev }

      if (cleaned === "") {
        delete next[id] // quita override
        return next
      }

      next[id] = Math.max(0, Number(cleaned))
      return next
    })
  }, [])


  const modified = useMemo(() => {
    const changes: Array<{ id: number; newQuantity: number }> = []

    for (const a of articles) {
      const base = Number(a.quantity ?? 0)
      const edited = editedQuantities[a.id]
      if (edited === undefined) continue

      const next = Math.max(0, Math.trunc(edited))
      if (next !== base) changes.push({ id: a.id, newQuantity: next })
    }

    return changes
  }, [articles, editedQuantities])

  const modifiedCount = modified.length
  const hasChanges = modifiedCount > 0

  const reset = useCallback(() => setEditedQuantities({}), [])

  return {
    state: { editedQuantities, baseQuantities, hasChanges },
    actions: { setQuantity, reset },
    utils: { modified, modifiedCount },
  }
}
