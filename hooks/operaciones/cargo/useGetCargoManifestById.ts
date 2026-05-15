"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { CargoManifest } from "@/types";

const fetchManifestById = async (
  company: string,
  id: string,
): Promise<CargoManifest> => {
  const { data } = await axiosInstance.get(`/${company}/cargo-manifests/${id}`);
  return data;
};

export const useGetCargoManifestById = (
  company: string | undefined,
  id: string,
) => {
  return useQuery({
    queryKey: ["cargo-manifests", company, id],
    queryFn: () => fetchManifestById(company!, id),
    enabled: !!company && !!id,
    staleTime: 1000 * 60 * 5,
  });
};
