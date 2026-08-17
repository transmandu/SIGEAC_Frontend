import { Airport } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchAirports = async (): Promise<Airport[]> => {
  const res = await fetch("/data/airports.json");
  if (!res.ok) {
    throw new Error("No se pudo cargar el catálogo de aeropuertos");
  }
  return res.json();
};

export const useAirports = () => {
  return useQuery<Airport[]>({
    queryKey: ["airports"],
    queryFn: fetchAirports,
    staleTime: Infinity,
  });
};
