"use client";

import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetCargoShipmentsByExternalAircraft = (
  company?: string,
  externalAircraft?: string,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoShipment[], Error>({
    queryKey: [
      "cargo-shipments-by-external-aircraft",
      company,
      externalAircraft,
      month,
      year,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/external-aircraft/${encodeURIComponent(externalAircraft || "")}`,
        { params: { month, year } },
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!externalAircraft && !!month && !!year,
  });
};
