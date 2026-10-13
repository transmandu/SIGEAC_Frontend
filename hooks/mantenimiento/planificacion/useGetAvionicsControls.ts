import axios from "@/lib/axios";
import { AvionicsControl } from "@/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const fetchAvionicsControls = async (
  company: string | undefined,
  includeRetired: boolean,
  withEstimate: boolean,
): Promise<AvionicsControl[]> => {
  const { data } = await axios.get(`/${company}/avionics-controls`, {
    params: {
      include_retired: includeRetired ? 1 : undefined,
      with_estimate: withEstimate ? 1 : undefined,
    },
  });
  return data;
};

/**
 * Por defecto solo los vigentes: son los que alimentan alertas y calendario.
 *
 * `withEstimate` pide además la fecha estimada de cada intervalo en horas/ciclos.
 * Cuesta una consulta de vuelos por control, así que solo lo pide quien la
 * muestra (las alertas críticas); las pantallas de lista no la usan.
 */
export const useGetAvionicsControls = (
  company: string | undefined,
  includeRetired = false,
  withEstimate = false,
) => {
  return useQuery<AvionicsControl[], Error>({
    queryKey: ["avionics-controls", company, { includeRetired, withEstimate }],
    queryFn: () => fetchAvionicsControls(company, includeRetired, withEstimate),
    placeholderData: keepPreviousData,
    enabled: !!company,
  });
};
