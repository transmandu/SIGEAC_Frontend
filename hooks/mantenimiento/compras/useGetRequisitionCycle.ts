import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { RequisitionCycle } from "@/types/purchase";

const fetchRequisitionCycle = async (
  company: string,
  id: number,
): Promise<RequisitionCycle> => {
  const { data } = await axios.get(`/${company}/requisition-order/${id}/cycle`);
  return data.data;
};

export const useGetRequisitionCycle = (
  id: number | undefined,
  company: string | undefined,
) =>
  useQuery<RequisitionCycle, Error>({
    // Cuelga del prefijo ['requisition-order']: cada mutación de la solicitud
    // (estado, prioridad, cotización, orden) ya lo invalida y el ciclo se
    // vuelve a pedir solo, sin cablear nada en cada acción.
    queryKey: ["requisition-order", company, "cycle", id],
    queryFn: () => fetchRequisitionCycle(company!, id!),
    enabled: !!company && !!id,
    // El almacén mueve los artículos sin tocar la solicitud: al volver a la
    // pestaña el ciclo se refresca por foco.
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
