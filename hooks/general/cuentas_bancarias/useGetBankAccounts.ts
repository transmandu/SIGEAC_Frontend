import axios from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankAccounts = async (companyId: number): Promise<BankAccount[]> => {
  const { data } = await axios.get(`/bank-accounts`, {
    params: { company_id: companyId },
  });
  return data;
};

/**
 * El recurso es multi-tenant: sin company_id el middleware responde 404 antes
 * de llegar al controlador, así que la consulta espera a que haya compañía.
 */
export const useGetBankAccounts = (companyId?: number) => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts", companyId],
    queryFn: () => fetchBankAccounts(companyId!),
    enabled: !!companyId,
  });
};
