import axiosInstance from "@/lib/axios";
import { BankCard } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankCards = async (companyId?: number): Promise<BankCard[]> => {
  const { data } = await axiosInstance.get(`/bank-cards`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return data;
};

/**
 * Sin companyId el backend responde según el rol: catálogo completo para
 * SUPERUSER, y las tarjetas de la compañía en contexto para el resto.
 */
export const useGetBankCards = (companyId?: number) => {
  return useQuery<BankCard[]>({
    queryKey: ["bank-cards", companyId],
    queryFn: () => fetchBankCards(companyId),
  });
};
