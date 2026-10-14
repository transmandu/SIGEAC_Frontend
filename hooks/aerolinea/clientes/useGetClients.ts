"use client";

import axiosInstance from "@/lib/axios";
import { AirlineClient } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchClients = async (
  company: string | undefined,
): Promise<AirlineClient[]> => {
  const { data } = await axiosInstance.get(`/${company}/airline/clients`);
  return data;
};

export const useGetClients = (company: string | undefined) => {
  return useQuery<AirlineClient[]>({
    queryKey: ["clients", "airline", company],
    queryFn: () => fetchClients(company),
    staleTime: 1000 * 60 * 2,
    enabled: !!company,
  });
};
