"use client";

import type { Client } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const fetchClientsAddBalanceById = async ({
  company,
  id,
}: {
  company?: string;
  id: string;
}): Promise<Client> => {
  const { data } = await axiosInstance.get(
    `/${company}/clients-add-balance/${id}`
  );
  return data;
};

export const useGetClientAddBalanceById = ({
  company,
  id,
}: {
  company?: string;
  id: string;
}) => {
  return useQuery<Client>({
    queryKey: ["balance", company , id ],
    queryFn: () => fetchClientsAddBalanceById({ company, id }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id && !!company, // Solo ejecuta la consulta si hay un ID
  });
};
