"use client";

import axiosInstance from "@/lib/axios";
import { CargoShipment } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAvailableShipments = async (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
  day?: number,
): Promise<any[]> => {
  const params: any= { month, year };
  if (aircraftId) params.aircraft_id = aircraftId;
  if (day) params.day = day;
  const {data} = await axiosInstance.get(`/${company}/cargo-manifests/available-shipments`, {params});
  return data;
}

export const useGetAvailableShipments = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
  day?: number,
) => {
  return useQuery({
    queryKey: ["available-shipments", month, year, aircraftId, day],
    queryFn: () => fetchAvailableShipments(company, month, year, aircraftId, day),
    enabled: !!company && !!month && !!year && !!aircraftId,
  });
}
