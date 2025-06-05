import axios from '@/lib/axios';
import { BankAccount } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchBankAccounts = async (): Promise<BankAccount[]> => {
  const {data} = await axios.get(`/bank-accounts`);
  return data;
};

export const useGetBankAccounts = () => {
  return useQuery<BankAccount[]>({
    queryKey: ["bank-accounts"],
    queryFn: fetchBankAccounts,
  });
};
