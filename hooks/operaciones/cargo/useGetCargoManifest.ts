"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { CargoManifest } from "@/types";

const fetchCargoManifests = async (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
): Promise<CargoManifest[]> => {
  const params: any = { month, year };
  if (aircraftId) params.aircraft_id = aircraftId;
  const { data } = await axiosInstance.get(`/${company}/cargo-manifests`, { params });
  return data;
}

export const useGetCargoManifest = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
) => {
  return useQuery<CargoManifest[]>({
    queryKey: ["cargo_manifests", month, year, aircraftId],
    queryFn: () => fetchCargoManifests(company, month, year, aircraftId),
    enabled: !!company,
  });
};