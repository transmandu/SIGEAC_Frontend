import axios from "@/lib/axios";
import { MaintenanceControlSnapshot } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchMaintenanceControlSnapshot = async (
  company: string | undefined,
  controlId: number | string | undefined,
  date: string,
): Promise<MaintenanceControlSnapshot> => {
  const { data } = await axios.get(`/${company}/maintenance-controls/${controlId}/snapshot`, {
    params: { date },
  });
  return data;
};

// Estado del control reconstruido a una fecha pasada — nada guardado por
// día, se recalcula al vuelo (ver MaintenanceControlSnapshotService). Solo
// se pide con el diálogo abierto y una fecha elegida.
export const useGetMaintenanceControlSnapshot = (
  company: string | undefined,
  controlId: number | string | undefined,
  date: string | undefined,
  enabled: boolean,
) => {
  return useQuery<MaintenanceControlSnapshot, Error>({
    queryKey: ["maintenance-control-snapshot", company, controlId, date],
    queryFn: () => fetchMaintenanceControlSnapshot(company, controlId, date as string),
    enabled: enabled && !!company && !!controlId && !!date,
  });
};
