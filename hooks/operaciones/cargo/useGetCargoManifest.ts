"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { CargoManifest } from "@/types";

export const useGetCargoManifest = (
  company: string | undefined,
  id: number | string | undefined,
) => {
  return useQuery({
    queryKey: ["cargo-manifests", company, id],
    queryFn: async (): Promise<CargoManifest> => {
      const { data } = await axiosInstance.get(
        `/${company}/cargo-manifests/${id}`,
      );
      return data;
    },
    enabled: !!company && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
