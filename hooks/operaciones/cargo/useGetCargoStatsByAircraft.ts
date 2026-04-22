"use client";

import axiosInstance from "@/lib/axios";
import { AircraftCargoResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetCargoStatsByAircraft = (
  company?: string,
  month?: number,
  year?: number,
) => {
  return useQuery<AircraftCargoResponse, Error>({
    queryKey: ["cargo-stats-by-aircraft", company, month, year],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/${company}/cargo-shipments/stats-by-aircraft`,
        { params: { month, year } },
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!month && !!year,
  });
};
