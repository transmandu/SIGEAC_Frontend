import axios from "@/lib/axios";
import { FlightControl } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchFlightControl = async (
  company: string | undefined,
  aircraftId: string | undefined,
): Promise<FlightControl[]> => {
  const { data } = await axios.get(`/${company}/flight-control`, {
    params: { aircraft_id: aircraftId },
  });
  return data;
};

/**
 * Vuelos de una aeronave. Se piden por aeronave y no todos de una vez: el
 * histórico de la empresa crece sin límite y la pantalla solo muestra uno.
 */
export const useGetFlightControl = (
  company: string | undefined,
  aircraftId: string | undefined,
) => {
  return useQuery<FlightControl[], Error>({
    queryKey: ["flight-control", company, aircraftId],
    queryFn: () => fetchFlightControl(company, aircraftId),
    enabled: !!company && !!aircraftId,
  });
};
