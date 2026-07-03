import axiosInstance from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankAccountsByBankId = async (bankId: string | number): Promise<BankAccount[]> => {
  const { data } = await axiosInstance.get(`/bank-accounts-by-bank/${bankId}`);
  return data;
};

export const useGetBankAccountsByBankId = (bankId?: string | number) => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts-by-bank", bankId],
    queryFn: () => fetchBankAccountsByBankId(bankId!),
    enabled: !!bankId,
  });
};
