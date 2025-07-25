import axios from "@/lib/axios";
import { Card } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCards = async (company?: string): Promise<Card[]> => {
  const { data } = await axios.get(`/${company}/cards`);
  return data;
};

export const useGetCards = (company?: string) => {
  return useQuery<Card[]>({
    queryKey: ["cards"],
    queryFn: () => fetchCards(company),
    enabled: !!company,
  });
};
