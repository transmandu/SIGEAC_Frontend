"use client";

import type { Client } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const fetchClientsByDni = async ({
  dni,
  company,
}: {
  dni: string;
  company: string | undefined;
}): Promise<Client> => {
  const { data } = await axiosInstance.get(`/${company}/clients/${dni}`);
  return data;
};

export const useGetClientByDni = ({
  dni,
  company,
}: {
  dni: string;
  company: string | undefined;
}) => {
  return useQuery<Client>({
    queryKey: ["clients", company, dni],
    queryFn: () => fetchClientsByDni({ dni, company }),
    staleTime: 1000 * 60 * 5,
    enabled: !!dni && !!company,
  });
};
