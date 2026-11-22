import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

/**
 * Traslados que otra sede mandó hacia la sede activa y todavía no se han
 * acusado. Mientras están aquí el material no cuenta en ningún inventario:
 * salió del almacén de origen y no entra al de destino hasta que alguien
 * confirma que llegó.
 */
export interface IncomingTransfer {
  id: number;
  request_number: string;
  status: "IN_TRANSFER";
  justification: string;
  created_by: string;
  requested_by: string;
  submission_date: string;
  /** Sede que despachó. La de destino no viaja aquí: es la sede activa. */
  location?: { id: number; cod_iata: string; address: string };
  requested_employee?: { first_name: string; last_name: string };
  /**
   * Solo las líneas que vienen a esta sede: el backend ya las acota, así que
   * lo que llega es exactamente lo que hay que recibir.
   */
  articles_dispatch: {
    id: number;
    quantity: string;
    dispatch_quantity?: string | null;
    dispatch_unit?: { label: string } | null;
    destination_location?: { id: number; cod_iata: string } | null;
    article?: {
      id: number;
      part_number: string;
      /** Identifica la pieza en lo serializado; el consumible usa lot_number. */
      serial?: string | null;
      description?: string | null;
      batch?: { name: string; category: string } | null;
      condition?: { name: string } | null;
      consumable?: {
        lot_number?: string | null;
        primary_unit?: { label: string } | null;
      } | null;
    } | null;
    general_article?: {
      id: number;
      description: string;
      brand_model?: string | null;
      general_primary_unit?: { label: string } | null;
    } | null;
  }[];
}

const fetchIncomingTransfers = async ({
  location_id,
  company,
}: {
  location_id: string | null;
  company?: string;
}): Promise<IncomingTransfer[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/incoming-transfers`);
  return data;
};

export const useGetIncomingTransfers = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();

  return useQuery<IncomingTransfer[], Error>({
    queryKey: ["incoming-transfers", selectedCompany?.slug, selectedStation],
    queryFn: () =>
      fetchIncomingTransfers({
        company: selectedCompany?.slug,
        location_id: selectedStation,
      }),
    enabled: !!selectedCompany && !!selectedStation,
  });
};
