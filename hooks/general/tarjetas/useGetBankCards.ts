import axiosInstance from "@/lib/axios";
import { BankCard } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankCards = async (companyId: number): Promise<BankCard[]> => {
  const { data } = await axiosInstance.get(`/bank-cards`, {
    params: { company_id: companyId },
  });
  return data;
};

/**
 * El recurso es multi-tenant: sin company_id el middleware responde 404 antes
 * de llegar al controlador, así que la consulta espera a que haya compañía.
 */
export const useGetBankCards = (companyId?: number) => {
  return useQuery<BankCard[]>({
    queryKey: ["bank-cards", companyId],
    queryFn: () => fetchBankCards(companyId!),
    enabled: !!companyId,
  });
};
