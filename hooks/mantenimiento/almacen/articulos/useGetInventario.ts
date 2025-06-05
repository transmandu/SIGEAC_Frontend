'use client'

import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

const fetchInventario = async () => {
  const response = await axiosInstance.get('/inventario')
  return response.data
}

export const useInventario = () => {
  return useQuery({
    queryKey: ['inventario'],
    queryFn: fetchInventario,
  })
}
