import axios from "@/lib/axios";
import { ControlQueue, ControlQueueFormat } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchControlQueue = async (
  company: string | undefined,
  aircraftId: number | string | undefined,
): Promise<ControlQueue> => {
  const { data } = await axios.get(`/${company}/control-queue`, {
    params: aircraftId ? { aircraft_id: aircraftId } : undefined,
  });
  return data;
};

/**
 * La bandeja de trabajo del usuario, sin filtrar: el panel vive en
 * DashboardLayout y la muestra completa, agrupada por aeronave, control y
 * conjunto — puede tener ítems de varias aeronaves a la vez.
 *
 * `aircraftId` la limita a esa aeronave, para un consumidor que necesite
 * mostrar solo lo de la que está viendo.
 */
export const useGetControlQueue = (
  company: string | undefined,
  aircraftId?: number | string,
) => {
  return useQuery<ControlQueue, Error>({
    queryKey: ["control-queue", company, aircraftId ?? null],
    queryFn: () => fetchControlQueue(company, aircraftId),
    enabled: !!company,
  });
};

const fetchControlQueueFormats = async (
  company: string | undefined,
  entryIds: number[],
): Promise<{ formats: ControlQueueFormat[] }> => {
  const { data } = await axios.get(`/${company}/control-queue/formats`, {
    params: { entry_ids: entryIds },
  });
  return data;
};

/**
 * Los formatos que la SELECCIÓN puede emitir (solo los que tienen filas). Se
 * recalcula al cambiar lo marcado, porque de eso depende qué hoja aplica.
 */
export const useGetControlQueueFormats = (
  company: string | undefined,
  entryIds: number[],
) => {
  return useQuery<{ formats: ControlQueueFormat[] }, Error>({
    // Ordenados: el mismo conjunto marcado en otro orden es la misma consulta.
    queryKey: ["control-queue-formats", company, [...entryIds].sort()],
    queryFn: () => fetchControlQueueFormats(company, entryIds),
    enabled: !!company && entryIds.length > 0,
  });
};
