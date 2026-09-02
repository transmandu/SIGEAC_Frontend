import { AuthorizedEmployee } from "@/app/[company]/ajustes/autorizaciones/autorizados/columns";
import type { DispatchArticle } from "@/app/[company]/almacen/solicitudes/salida/page";
import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { MaintenanceAircraft } from "@/types";
import { useQuery } from "@tanstack/react-query";

/**
 * `articles` reusa DispatchArticle en vez de redeclararlo: eran dos
 * definiciones del mismo contrato y ya habían divergido —esta se quedó sin los
 * campos de devolución y evidencia—, así que la tabla recibía datos tipados
 * como algo más pobre de lo que el backend manda.
 */
interface IDispatch {
  id: number;
  request_number: string;
  requested_by: string;
  auhtorized_employee?: AuthorizedEmployee;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  category?: string;
  work_order?: string;
  aircraft?: MaintenanceAircraft;
  articles: DispatchArticle[];
}

const fetchDispatchesRequests = async ({
  location_id,
  company,
}: {
  location_id: string | null;
  company?: string;
}): Promise<IDispatch[]> => {
  const { data } = await axios.get(`/${company}/${location_id}/show-dispatch`);
  return data;
};

export const useGetDispatchesByLocation = () => {
  const { selectedStation, selectedCompany } = useCompanyStore();
  return useQuery<IDispatch[], Error>({
    queryKey: ["dispatches-requests", selectedCompany?.slug, selectedStation],
    queryFn: () =>
      fetchDispatchesRequests({
        company: selectedCompany?.slug,
        location_id: selectedStation,
      }),
    enabled : !!selectedCompany && !! selectedStation
  });
};
