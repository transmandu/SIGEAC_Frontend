"use client";

import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetCargoShipmentsByAircraft = (
  company?: string,
  aircraft_id?: string | number,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoShipment[], Error>({
    queryKey: [
      "cargo-shipments-by-aircraft",
      company,
      aircraft_id,
      month,
      year,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/aircraft/${aircraft_id}`,
        { params: { month, year } },
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!aircraft_id && !!month && !!year,
  });
};
