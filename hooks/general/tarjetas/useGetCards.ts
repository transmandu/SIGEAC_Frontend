import axiosInstance from "@/lib/axios";
import { Card } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchCards = async (): Promise<Card[]> => {
  const { data } = await axiosInstance.get(`/cards`);
  return data;
};

export const useGetCards = () => {
  return useQuery<Card[]>({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });
};
