import axiosInstance from "@/lib/axios";
import { Pilot } from "@/types";
import { useQuery } from "@tanstack/react-query";

export type PilotName = Pick<Pilot, "id"> & {
  employee: Pick<Pilot["employee"], "first_name" | "last_name">;
};

// Ruta pública: la usa el formulario de reportes sin sesión, así que el
// backend solo entrega lo necesario para elegir al piloto.
const fetchPilotNames = async (company?: string): Promise<PilotName[]> => {
  const { data } = await axiosInstance.get(`/${company}/pilot-names`);
  return data;
};

export const useGetPilotNames = (company?: string) => {
  return useQuery<PilotName[]>({
    queryKey: ["pilot-names", company],
    queryFn: () => fetchPilotNames(company),
    staleTime: 1000 * 60 * 5,
    enabled: !!company,
  });
};
