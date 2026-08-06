import axios from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankAccounts = async (companyId?: number): Promise<BankAccount[]> => {
  const { data } = await axios.get(`/bank-accounts`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return data;
};

/**
 * Sin companyId el backend responde según el rol: catálogo completo para
 * SUPERUSER, y las cuentas de la compañía en contexto para el resto.
 */
export const useGetBankAccounts = (companyId?: number) => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts", companyId],
    queryFn: () => fetchBankAccounts(companyId),
  });
};
