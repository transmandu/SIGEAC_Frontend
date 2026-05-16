"use client";

import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetAvailableShipments = (
  company?: string,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoShipment[], Error>({
    queryKey: ["available-shipments-for-manifest", company, month, year],
    queryFn: async () => {
      const { data } = await axiosInstance(
        `/${company}/cargo-manifests/available-shipments`,
        { params: { month, year } },
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!month && !!year,
  });
};
