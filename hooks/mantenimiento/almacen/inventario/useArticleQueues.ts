import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  InspectionQueueArticle,
  InspectionQueueStatus,
  ToDeterminateQueueArticle,
  TransitQueueArticle,
  WaitingToLocateQueueArticle,
} from "@/types/inventory/queues";
import { useQuery } from "@tanstack/react-query";

/**
 * Colas de trabajo de artículos por estado, una por pantalla y por sede.
 *
 * La clave empieza por ["articles", compañía, ESTADO]: es la que ya invalidan
 * las acciones que cambian el estado de un artículo, así que las colas se
 * refrescan solas al recibir, inspeccionar, ubicar o determinar destino. La
 * sede va al final para no romper ese prefijo.
 */
const useQueue = <T>(
  status: string,
  path: string,
  params?: Record<string, string>,
) => {
  const { selectedCompany, selectedStation } = useCompanyStore();

  return useQuery<T[]>({
    queryKey: ["articles", selectedCompany?.slug, status, selectedStation],
    queryFn: async () => {
      const { data } = await axios.get(
        `/${selectedCompany?.slug}/${selectedStation}/articles/queues/${path}`,
        { params },
      );
      // La cola de tránsito responde { data, counts }; las demás, la lista.
      return Array.isArray(data) ? data : data.data;
    },
    staleTime: 1000 * 60,
    enabled: !!selectedCompany?.slug && !!selectedStation,
  });
};

/** Recepción del almacén y compras · en tránsito. */
export const useTransitQueue = (status: "TRANSIT" | "RECEPTION") =>
  useQueue<TransitQueueArticle>(status, "transit", { status });

/** Compras · destino indeterminado. */
export const useToDeterminateQueue = () =>
  useQueue<ToDeterminateQueueArticle>("TO_DETERMINATE", "to-determinate");

/** Almacén · por ubicar. */
export const useWaitingToLocateQueue = () =>
  useQueue<WaitingToLocateQueueArticle>(
    "WAITING_TO_LOCATE",
    "waiting-to-locate",
  );

/** Control de calidad. */
export const useInspectionQueue = (status: InspectionQueueStatus) =>
  useQueue<InspectionQueueArticle>(status, "inspection", { status });
