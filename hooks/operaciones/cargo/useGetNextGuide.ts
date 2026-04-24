import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const fetchNextGuide = async (
  company: string | undefined,
  date: string,
  aircraftId: number | null,
  externalAircraft: string | null,
): Promise<{ guide_number: string }> => {
  const params = new URLSearchParams({ date });
  if (aircraftId) params.append("aircraft_id", String(aircraftId));
  if (externalAircraft) params.append("external_aircraft", externalAircraft);

  const { data } = await axiosInstance.get(
    `/${company}/cargo-shipments/next-guide?${params.toString()}`,
  );
  return data;
};

export const useGetNextGuide = (
  company: string | undefined,
  date: string,
  aircraftId: number | null,
  externalAircraft: string | null,
) => {
  return useQuery({
    queryKey: ["cargoNextGuide", company, date, aircraftId, externalAircraft],
    queryFn: () => fetchNextGuide(company, date, aircraftId, externalAircraft),
    staleTime: 1000 * 60,
    enabled: !!company && !!date && (!!aircraftId || !!externalAircraft),
  });
};
