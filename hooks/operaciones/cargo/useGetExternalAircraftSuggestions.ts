"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetExternalAircraftSuggestions = (company?: string) => {
  return useQuery<string[], Error>({
    queryKey: ["external-aircraft-suggestions", company],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/external-aircraft-suggestions`
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company,
  });
};
