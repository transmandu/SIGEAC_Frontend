import axiosInstance from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankAccountsByBankId = async (
  bankId: string | number,
  companyId: number
): Promise<BankAccount[]> => {
  const { data } = await axiosInstance.get(`/bank-accounts-by-bank/${bankId}`, {
    params: { company_id: companyId },
  });
  return data;
};

export const useGetBankAccountsByBankId = (
  bankId?: string | number,
  companyId?: number
) => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts-by-bank", bankId, companyId],
    queryFn: () => fetchBankAccountsByBankId(bankId!, companyId!),
    enabled: !!bankId && !!companyId,
  });
};
