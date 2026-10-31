"use client";

import axiosInstance from "@/lib/axios";
import { CargoBillingClientSummary } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCargoBillingClients = async (
  company: string,
): Promise<CargoBillingClientSummary[]> => {
  const { data } = await axiosInstance.get(`/${company}/cargo-billing/clients`);
  return data;
};

export const useGetCargoBillingClients = (company?: string) => {
  return useQuery<CargoBillingClientSummary[]>({
    queryKey: ["cargo-billing-clients", company],
    queryFn: () => fetchCargoBillingClients(company!),
    enabled: !!company,
  });
};
