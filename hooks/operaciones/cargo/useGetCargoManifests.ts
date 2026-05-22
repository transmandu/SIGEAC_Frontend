"use client";
import axiosInstance from "@/lib/axios";
import { CargoManifest } from "@/types";
import { useQuery } from "@tanstack/react-query";

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
};
export const useGetCargoManifests = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
) => {
  return useQuery<CargoManifest[]>({
    queryKey: ["cargo-manifests", month, year, aircraftId],
    queryFn: () => fetchCargoManifests(company, month, year, aircraftId),
    enabled: !!company,
  });
};
