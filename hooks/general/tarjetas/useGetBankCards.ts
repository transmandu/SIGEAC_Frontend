import axiosInstance from "@/lib/axios";
import { BankCard } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBankCards = async (): Promise<BankCard[]> => {
  const { data } = await axiosInstance.get(`/bank-cards`);
  return data;
};

export const useGetBankCards = () => {
  return useQuery<BankCard[]>({
    queryKey: ["bank-cards"],
    queryFn: fetchBankCards,
  });
};
