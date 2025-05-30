import axios from '@/lib/axios';
import { Card } from '@/types';
import { useQuery } from '@tanstack/react-query';


const fetchCards = async (): Promise<Card[]> => {
  const {data} = await axios.get(`/cards`);
  return data;
};

export const useGetCards = () => {
  return useQuery<Card[]>({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });
};
