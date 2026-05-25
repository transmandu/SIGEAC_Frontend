"use client";
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
const fetchNextManifestNumber = async (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
  externalAircraft?: string | null,
): Promise<string> => {
  const params: any = { month, year };
  if (aircraftId) params.aircraft_id = aircraftId;
  if (externalAircraft) params.external_aircraft = externalAircraft;
  const { data } = await axiosInstance.get(
    `/${company}/cargo-manifests/next-number`,
    { params},
  );
  return data.manifest_number as string;
};
export const useGetNextManifestNumber = (
  company: string,
  month: number,
  year: number,
  aircraftId?: number | null,
  externalAircraft?: string | null,
) => {
  return useQuery<string>({
    queryKey: ["next-manifest-number", month, year, aircraftId, externalAircraft],
    queryFn: () =>
      fetchNextManifestNumber(company, month, year, aircraftId, externalAircraft),
    enabled: !!company && !!month && !!year && (!!aircraftId || !!externalAircraft),
  });
};