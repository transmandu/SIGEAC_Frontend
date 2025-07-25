import axios from "@/lib/axios";
import { BankAccount } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankAccounts = async (company?: string): Promise<BankAccount[]> => {
  const { data } = await axios.get(`/${company}/bank-accounts`);
  return data;
};

export const useGetBankAccounts = (company?: string) => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: () => fetchBankAccounts(company),
    enabled: !!company,
  });
};
