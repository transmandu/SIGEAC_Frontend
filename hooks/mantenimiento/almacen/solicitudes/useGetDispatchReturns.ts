import axios from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useQuery } from "@tanstack/react-query";

export interface DispatchReturnItem {
  article_dispatch_order_id: number;
  // En la unidad en que se despachó, que es en la que se registró la
  // devolución; `base_quantity` es lo que realmente movió el inventario.
  quantity: number;
  unit: string;
  base_quantity: number;
  base_unit: string;
  uses_alternate_unit: boolean;
  description: string;
  part_number?: string | null;
  serial?: string | null;
}

export interface DispatchReturn {
  id: number;
  // SEALED volvió intacto al almacén; ALTERED pasó a inspección de incoming.
  condition: "SEALED" | "ALTERED";
  justification: string;
  returned_by: string;
  returned_at: string;
  items: DispatchReturnItem[];
  /** Fotos de cómo volvió el material; opcionales. */
  evidences: {
    id: number;
    url: string | null;
    article_dispatch_order_id: number;
  }[];
}

const fetchDispatchReturns = async ({
  id,
  company,
}: {
  id: number | string;
  company?: string;
}): Promise<DispatchReturn[]> => {
  const { data } = await axios.get(`/${company}/dispatch-order/${id}/returns`);
  return data.data;
};

export const useGetDispatchReturns = (
  id: number | string,
  enabled = true
) => {
  const { selectedCompany } = useCompanyStore();

  return useQuery<DispatchReturn[], Error>({
    queryKey: ["dispatch-returns", id],
    queryFn: () => fetchDispatchReturns({ id, company: selectedCompany?.slug }),
    enabled: !!selectedCompany && !!id && enabled,
  });
};
