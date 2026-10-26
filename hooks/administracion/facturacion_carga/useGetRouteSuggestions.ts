"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetRouteSuggestions = (
  company: string | undefined,
  search: string,
) => {
  return useQuery<string[], Error>({
    queryKey: ["route-suggestions", company, search],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      const { data } = await axiosInstance.get(
        `/${company}/cargo-billing/routes/suggestions`,
        { params },
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!company && search.length >= 2,
  });
};
