import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

/** Segmento de ruta de cada control: `/{company}/{resource}/{id}/snapshot`. */
export type ControlSnapshotResource =
  | "maintenance-controls"
  | "directive-controls"
  | "component-controls"
  | "avionics-controls";

const fetchControlSnapshot = async <TSnapshot>(
  company: string | undefined,
  resource: ControlSnapshotResource,
  controlId: number | string | undefined,
  date: string,
): Promise<TSnapshot> => {
  const { data } = await axios.get(
    `/${company}/${resource}/${controlId}/snapshot`,
    { params: { date } },
  );
  return data;
};

// Estado del control reconstruido a una fecha pasada — nada guardado por
// día, se recalcula al vuelo (ver los *ControlSnapshotService del backend).
// Solo se pide con el diálogo abierto y una fecha elegida.
export const useGetControlSnapshot = <TSnapshot>(
  resource: ControlSnapshotResource,
  company: string | undefined,
  controlId: number | string | undefined,
  date: string | undefined,
  enabled: boolean,
) => {
  return useQuery<TSnapshot, Error>({
    queryKey: ["control-snapshot", resource, company, controlId, date],
    queryFn: () =>
      fetchControlSnapshot<TSnapshot>(
        company,
        resource,
        controlId,
        date as string,
      ),
    enabled: enabled && !!company && !!controlId && !!date,
  });
};
