import axios from "@/lib/axios";
import { Aircraft } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface DispatchReport {
  id: number;
  request_number: string;
  status: string;
  requested_by: string;
  approved_by: string;
  delivered_by: string;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  work_order?: string;
  aircraft?: Aircraft;
  articles: {
    id: number;
    part_number: string;
    alternative_part_number?: string[];
    serial?: string;
    description: string;
    quantity: number;
    quantity_used: string;
    unit_label: string;
  }[];
}

interface DispatchParams {
  location_id: string;
  company: string;
  from?: string;
  to?: string;
  aircraft_id?: string | null; // <-- Nueva propiedad opcional
}

const fetchDispatchReport = async ({
  location_id,
  company,
  from,
  to,
  aircraft_id, // <-- Recibir el ID
}: DispatchParams): Promise<DispatchReport[]> => {
  const params = new URLSearchParams();

  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (aircraft_id) params.append("aircraft_id", aircraft_id); // <-- Añadir a los params si existe

  const url = `/${company}/${location_id}/report-dispatch-orders${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const { data } = await axios.get(url);

  if (Array.isArray(data) && data.length === 0) {
    toast.info("Sin resultados", {
      description: `No hay datos de despacho para los filtros seleccionados.`,
    });
  }

  return data;
};

export const useGetDispatchReport = () => {
  return useMutation({
    mutationFn: fetchDispatchReport,
  });
};
