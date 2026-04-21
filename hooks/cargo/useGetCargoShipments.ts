"use client";
import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";
import { useQuery } from "@tanstack/react-query";
export const useGetCargoShipments = (
  company?: string,
  month?: number,
  year?: number,
) => {
  return useQuery<CargoShipment[], Error>({
    queryKey: ["cargo-shipments", company, month, year],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/${company}/cargo-shipments`, {
        params: { month, year },
      });
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: !!company && !!month && !!year,
  });
};
