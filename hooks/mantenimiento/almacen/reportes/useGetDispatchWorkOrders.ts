"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface DispatchWorkOrder {
  id: number;
  work_order: string;
  work_order_id: number | null;
}

export const useGetDispatchWorkOrders = (company?: string) => {
  return useQuery<DispatchWorkOrder[]>({
    queryKey: ["dispatch-work-orders", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/dispatch-work-orders`);
      return data;
    },
    enabled: !!company,
  });
};
