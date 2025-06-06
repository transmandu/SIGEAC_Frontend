import axiosInstance from "@/lib/axios";
import { Pilot, User, VoluntaryReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetcPilotByDni = async (dni: string) => {
  const { data } = await axiosInstance.get(`transmandu/pilots/${dni}`);
  return data;
};

export const useGetPilotByDni = (dni: string) => {
  return useQuery<Pilot>({
    queryKey: ["pilots", dni], // Incluye el ID en la clave de la query
    queryFn: () => fetcPilotByDni(dni), // Pasa el ID a la función fetchUser
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
