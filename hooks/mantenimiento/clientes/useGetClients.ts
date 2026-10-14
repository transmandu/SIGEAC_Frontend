"use client";

import axiosInstance from "@/lib/axios";
import { AeronauticalClient } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchClients = async (
  company: string | undefined,
): Promise<AeronauticalClient[]> => {
  const { data } = await axiosInstance.get(`/${company}/aeronautical/clients`);
  return data;
};

export const useGetClients = (company: string | undefined) => {
  return useQuery<AeronauticalClient[]>({
    queryKey: ["clients", "aeronautical", company],
    queryFn: () => fetchClients(company),
    staleTime: 1000 * 60 * 2,
    enabled: !!company,
  });
};
