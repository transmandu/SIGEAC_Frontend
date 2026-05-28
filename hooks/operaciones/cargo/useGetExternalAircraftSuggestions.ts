"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type ExternalAircraftSuggestion = {
  id: number;
  acronym: string;
  model: string | null;
}

export const useGetExternalAircraftSuggestions = (
  company: string,
  search?: string,
) => {
  return useQuery<ExternalAircraftSuggestion[], Error>({
    queryKey: ["External-suggestions", company, search],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/external-aircraft-suggestions`, { params },
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
}
