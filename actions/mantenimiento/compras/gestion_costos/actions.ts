import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/* =========================
   TYPES
========================= */

type UpdateCostPayload = {
  company: string
  id: number
  cost: number
}

type BulkUpdateItem = {
  id: number
  cost: number
}

type BulkUpdatePayload = {
  company: string
  updates: BulkUpdateItem[]
}

/* =========================
   API CALLS
========================= */
const invalidateArticles = (queryClient: any) => {
  queryClient.invalidateQueries({
    queryKey: ["warehouse-articles"],
    exact: false,
  })

  queryClient.invalidateQueries({
    queryKey: ["warehouse-articles-all"],
    exact: false,
  })
}
const invalidateGeneral = (queryClient: any) => {
  queryClient.invalidateQueries({
    queryKey: ["general-articles"],
    exact: false,
  })
}

// 🔹 ARTICLE
const updateArticleCost = async ({ company, id, cost }: UpdateCostPayload) => {
  const { data } = await axiosInstance.put(
    `/${company}/update-article-cost/${id}`,
    { cost }
  )
  return data
}

const bulkUpdateArticleCost = async ({ company, updates }: BulkUpdatePayload) => {
  const { data } = await axiosInstance.post(
    `/${company}/bulk-update-article-cost`,
    { updates }
  )
  return data
}

// 🔹 GENERAL ARTICLE
const updateGeneralCost = async ({ company, id, cost }: UpdateCostPayload) => {
  const { data } = await axiosInstance.put(
    `/${company}/update-general-cost/${id}`,
    { cost }
  )
  return data
}

const bulkUpdateGeneralCost = async ({ company, updates }: BulkUpdatePayload) => {
  const { data } = await axiosInstance.post(
    `/${company}/bulk-update-general-cost`,
    { updates }
  )
  return data
}

/* =========================
   HOOKS (React Query)
========================= */

export const useUpdateArticleCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateArticleCost,
    onSuccess: () => {
      toast.success("Costo actualizado correctamente")
      invalidateArticles(queryClient)
    },
    onError: () => {
      toast.error("Error al actualizar costo")
    },
  })
}

export const useBulkUpdateArticleCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkUpdateArticleCost,
    onSuccess: () => {
      toast.success("Costos actualizados correctamente")
      invalidateArticles(queryClient)
    },
    onError: () => {
      toast.error("Error en actualización masiva")
    },
  })
}

export const useUpdateGeneralCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGeneralCost,
    onSuccess: () => {
      toast.success("Costo actualizado correctamente")
      invalidateGeneral(queryClient)
    },
    onError: () => {
      toast.error("Error al actualizar costo")
    },
  })
}

export const useBulkUpdateGeneralCost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkUpdateGeneralCost,
    onSuccess: () => {
      toast.success("Costos actualizados correctamente")
      invalidateGeneral(queryClient)
    },
    onError: () => {
      toast.error("Error en actualización masiva")
    },
  })
}