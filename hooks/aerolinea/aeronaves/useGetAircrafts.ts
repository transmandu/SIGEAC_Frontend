"use client";

import axiosInstance from "@/lib/axios";
import { AirlineAircraft } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface Options {
  /** Suma las aeronaves externas (de terceros, solo para registrar carga). */
  includeExternal?: boolean;
}

const fetchAircrafts = async (
  company: string | undefined,
  includeExternal: boolean,
): Promise<AirlineAircraft[]> => {
  const { data } = await axiosInstance.get(`/${company}/airline/aircrafts`, {
    params: includeExternal ? { include_external: 1 } : undefined,
  });
  return data;
};

export const useGetAircrafts = (
  company: string | undefined,
  { includeExternal = false }: Options = {},
) => {
  return useQuery<AirlineAircraft[]>({
    queryKey: ["aircrafts", "airline", company, { includeExternal }],
    queryFn: () => fetchAircrafts(company, includeExternal),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
