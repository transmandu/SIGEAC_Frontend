"use client"

import { PurchaseOrder } from '@/types';
import { useQuery } from '@tanstack/react-query';
import  axiosInstance from "@/lib/axios"

// Definir la estructura de datos que devuelve el endpoint
export interface Statistics {
    statistics: {
      total_payed_annual: {
        yearNumber: number
      }
      monthly_total: {
        [yearNumber: string]: {
          [month: string]: number
        }
      }
      monthly_transport_to_venezuela: {
        [yearNumber: string]: {
          [month: string]: number
        }
      }
      monthly_transport_usa: {
        [yearNumber: string]: {
          [month: string]: number
        }
      }
      monthly_taxes: {
        [yearNumber: string]: {
          [month: string]: number
        }
      }
      monthly_wire_fee: {
        [yearNumber: string]: {
          [month: string]: number
        }
      }
      monthly_handling_fee: {
        [yearNumber: string]: {
          [month: string]: number
        }
      },
      monthly_completed_purchase_orders: {
        [year: string]: {
          [month: string]: PurchaseOrder[]
        }
      }
    }
}

const fetchStatisticsPurchaseOrders = async (location_id: string | null): Promise<Statistics> => {
    const { data } = await axiosInstance.get(`/completed-purchases-statistics/${location_id}`)
    return data
}

export const useGetStatisticsPurchaseOrders = (location_id: string | null) => {
    return useQuery<Statistics>({
      queryKey: ["purchase-orders"],
      queryFn: () => fetchStatisticsPurchaseOrders(location_id),
      staleTime: 1000 * 60 * 5, // 5 minutos
      enabled: !!location_id,
    })
}
