"use client";

import axiosInstance from "@/lib/axios";
import { CargoChargePayment } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCargoChargePayments = async (
  company: string,
  clientId: number,
): Promise<CargoChargePayment[]> => {
  const { data } = await axiosInstance.get(
    `/${company}/cargo-billing/clients/${clientId}/payments`,
  );
  return data;
};

export const useGetCargoChargePayments = (
  company?: string,
  clientId?: number,
) => {
  return useQuery<CargoChargePayment[]>({
    queryKey: ["cargo-charge-payments", clientId],
    queryFn: () => fetchCargoChargePayments(company!, clientId!),
    enabled: !!company && !!clientId,
  });
};
