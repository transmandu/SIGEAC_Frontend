import axios from "@/lib/axios";
import { Module } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchModules = async (company?: string): Promise<Module[]> => {
  const response = await axios.get(`/${company}/modules`);
  const permissions = response.data;
  return permissions;
};

export const useGetModules = (company?: string) => {
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: () => fetchModules(company),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!company,
  });
};
