import axios from "@/lib/axios";
import { Bank } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchBanks = async (company?: string): Promise<Bank[]> => {
  const { data } = await axios.get(`/${company}/banks`);
  return data;
};

export const useGetBanks = (company?: string) => {
  return useQuery<Bank[]>({
    queryKey: ["banks",company],
    queryFn: () => fetchBanks(company),
    enabled: !!company,
  });
};
