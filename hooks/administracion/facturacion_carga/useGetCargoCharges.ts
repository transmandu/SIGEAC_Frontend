"use client";
import axiosInstance from "@/lib/axios";
import { CargoChargesResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCargoCharges = async (
  company: string,
  clientId: number,
  month?: number,
  year?: number,
): Promise<CargoChargesResponse> => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await axiosInstance.get(
    `/${company}/cargo-billing/clients/${clientId}/charges`,
    { params },
  );
  return data;
};

export const useGetCargoCharges = (
  company?: string,
  clientId?: number,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoChargesResponse>({
    queryKey: ["cargo-charges", clientId, month, year],
    queryFn: () => fetchCargoCharges(company!, clientId!, month, year),
    enabled: !!company && !!clientId,
  });
};
