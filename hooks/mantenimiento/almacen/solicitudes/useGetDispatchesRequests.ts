import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Article, Batch, DispatchRequest, WorkOrder } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

interface IDispatch {
  id: number;
  requested_by: string;
  created_by: string;
  justification: string;
  destination_place: string;
  submission_date: string;
  status: "PROCESO" | "APROBADO" | "RECHAZADO";
  work_order?: WorkOrder;
  articles: {
    id: number;
    part_number: string;
    serial: string;
    description: string;
    dispatch_quantity: string;
  }[];
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
