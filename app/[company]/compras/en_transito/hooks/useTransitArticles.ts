'use client'

import { useMemo } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useCompanyStore } from '@/stores/CompanyStore'

import { useGetArticlesByStatus } from '@/hooks/mantenimiento/almacen/articulos/useGetArticlesByStatus'

import type {
  TransitArticle,
  TransitStatusFilter,
} from '../types'

const ALMACEN_ROLES = [
  'ALMACEN',
  'JEFE_ALMACEN',
  'ANALISTA_ALMACEN',
  'SUPERUSER',
]

type Params = {
  status: TransitStatusFilter
}

export const useTransitArticles = ({ status }: Params) => {
  const { user } = useAuth()
  const { selectedCompany } = useCompanyStore()

  const {
    data: transitArticles,
    isLoading: loadingTransit,
  } = useGetArticlesByStatus('TRANSIT')

  const {
    data: receptionArticles,
    isLoading: loadingReception,
  } = useGetArticlesByStatus('RECEPTION')

  // ✅ FIX REAL: todo dentro del memo (sin dependencia inestable)
  const canView = useMemo(() => {
    const roles = user?.roles?.map((r) => r.name) ?? []

    return ALMACEN_ROLES.some((r) =>
      roles.includes(r)
    )
  }, [user?.roles])

  const articles = useMemo<TransitArticle[]>(() => {
    const transit =
      (transitArticles as TransitArticle[]) ?? []

    const reception =
      (receptionArticles as TransitArticle[]) ?? []

    if (status === 'TRANSIT') return transit
    if (status === 'RECEPTION') return reception

    return [...transit, ...reception]
  }, [transitArticles, receptionArticles, status])

  const totals = useMemo(() => {
    const transit =
      (transitArticles as TransitArticle[]) ?? []

    const reception =
      (receptionArticles as TransitArticle[]) ?? []

    return {
      totalTransit: transit.length,
      totalReception: reception.length,
    }
  }, [transitArticles, receptionArticles])

  const isLoading = loadingTransit || loadingReception

  return {
    articles,
    canView,
    totalTransit: totals.totalTransit,
    totalReception: totals.totalReception,
    isLoading,
    isError: false,
    company: selectedCompany?.slug ?? null,
  }
}