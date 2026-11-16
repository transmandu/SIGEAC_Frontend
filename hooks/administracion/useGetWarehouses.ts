import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Warehouse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchWarehouses = async (
  company: string,
  withCounts = false,
): Promise<Warehouse[]> => {
  const { data } = await axiosInstance.get(`/${company}/warehouses`, {
    params: withCounts ? { with_counts: 1 } : undefined,
  });
  return data.warehouses;
};

export const useGetWarehouses = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<Warehouse[]>({
    queryKey: ["warehouses", selectedCompany?.slug],
    queryFn: () => fetchWarehouses(selectedCompany!.slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedCompany,
  });
};

/**
 * Almacenes con cuántos registros cuelgan de cada uno (`records_count`), para
 * la pantalla de ajustes. El conteo lo calcula el servidor y lo decide al
 * eliminar o mover un almacén, así que aquí no se guarda en caché: cada visita
 * lo lee de nuevo. Los selectores usan `useGetWarehouses`, que no lo pide.
 */
export const useGetWarehousesWithCounts = () => {
  const { selectedCompany } = useCompanyStore();
  return useQuery<Warehouse[]>({
    queryKey: ["warehouses", selectedCompany?.slug, "with-counts"],
    queryFn: () => fetchWarehouses(selectedCompany!.slug, true),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!selectedCompany,
  });
};
