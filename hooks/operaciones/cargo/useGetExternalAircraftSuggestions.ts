"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetExternalAircraftSeggestion = (
  company: string,
  search?: string,
) => {
  return useQuery<string[], Error>({
     queryKey: ["external-suggestions", company, search],
     queryFn: async () => {
      const params: any = {};
      if(search) params.search = search;
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/external-aircraft-suggestions`, { params },
      );
      return data;
     },
     staleTime: 1000 * 60 * 5,
     enabled: !!company,
  });
}
