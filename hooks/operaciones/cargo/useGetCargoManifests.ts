"use client";
import axiosInstance from "@/lib/axios";
import { CargoManifest } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetCargoManifests = (
  company?: string,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoManifest[], Error>({
    queryKey: ["cargo-manifests", company, month, year],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/cargo-manifests`, {
        params: { month, year },
      });
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!month && !!year,
  });
};
